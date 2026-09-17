package com.lolrank.ai;

import com.lolrank.ai.dto.AiStatusResponse;
import com.lolrank.ai.dto.CommentaryResponse;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.common.exception.ApiException;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.Team;
import com.lolrank.team.TeamSlot;
import com.lolrank.team.TeamSlotRepository;
import com.lolrank.team.balance.TeamBalance;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 팀 보드 → 장로의 경기 전 해설. 같은 배치는 캐시에서 돌려줘 API 호출을 아낀다. */
@Service
public class CommentaryService {

    /** 보드 한 개당 슬롯 수 (5 포지션 × 2 팀) */
    private static final int FULL_BOARD = 10;
    private static final int CACHE_MAX = 300;

    private final RoomService roomService;
    private final TeamSlotRepository slotRepository;
    private final CommentaryGenerator generator;

    /** key = inviteCode + ":" + boardHash. 접근 순서 LRU. */
    private final Map<String, CommentaryResponse> cache = new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, CommentaryResponse> eldest) {
            return size() > CACHE_MAX;
        }
    };

    public CommentaryService(RoomService roomService, TeamSlotRepository slotRepository, CommentaryGenerator generator) {
        this.roomService = roomService;
        this.slotRepository = slotRepository;
        this.generator = generator;
    }

    public AiStatusResponse status() {
        return new AiStatusResponse(generator.isEnabled(), generator.isEnabled() ? "deepseek" : null,
                generator.isEnabled() ? generator.modelName() : null);
    }

    @Transactional(readOnly = true)
    public CommentaryResponse commentary(String inviteCode) {
        if (!generator.isEnabled()) {
            throw new ApiException(HttpStatus.CONFLICT, "AI_DISABLED", "AI 해설이 설정되지 않았습니다. (DEEPSEEK_API_KEY)");
        }
        Room room = roomService.getByInviteCode(inviteCode);
        List<TeamSlot> slots = slotRepository.findAllByRoomId(room.getId());
        long filled = slots.stream().filter(s -> s.getCharacter() != null).count();
        if (filled < FULL_BOARD) {
            throw new BadRequestException("10자리가 모두 채워져야 장로가 해설할 수 있습니다. (현재 " + filled + "/10)");
        }

        String hash = CommentaryPromptBuilder.boardHash(slots);
        String key = room.getInviteCode() + ":" + hash;
        synchronized (cache) {
            CommentaryResponse hit = cache.get(key);
            if (hit != null) {
                return hit.asCached();
            }
        }

        List<PlayerCharacter> blue = slots.stream().filter(s -> s.getTeam() == Team.BLUE && s.getCharacter() != null).map(TeamSlot::getCharacter).toList();
        List<PlayerCharacter> red = slots.stream().filter(s -> s.getTeam() == Team.RED && s.getCharacter() != null).map(TeamSlot::getCharacter).toList();
        TeamBalance balance = TeamBalance.of(blue, red);
        String text = generator.generate(CommentaryPromptBuilder.SYSTEM_PROMPT,
                CommentaryPromptBuilder.userPrompt(room.getName(), slots, balance));

        CommentaryResponse fresh = new CommentaryResponse(text, hash, false, generator.modelName(), Instant.now());
        synchronized (cache) {
            cache.put(key, fresh);
        }
        return fresh;
    }
}

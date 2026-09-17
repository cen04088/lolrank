package com.lolrank.ai;

import com.lolrank.ai.dto.AiStatusResponse;
import com.lolrank.ai.dto.CommentaryResponse;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.common.exception.ApiException;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.match.RatingService;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * 팀 보드 → 장로의 경기 전 해설. 같은 배치는 캐시에서 돌려줘 API 호출을 아낀다.
 *
 * <p>DB 조회(스냅샷)는 짧은 읽기 전용 트랜잭션 안에서 끝내고, 수십 초가 걸릴 수 있는 LLM 호출은
 * 트랜잭션 밖에서 한다. 그렇지 않으면 해설을 기다리는 동안 커넥션 풀이 묶인다.
 */
@Service
public class CommentaryService {

    /** 보드 한 개당 슬롯 수 (5 포지션 × 2 팀) */
    private static final int FULL_BOARD = 10;
    private static final int CACHE_MAX = 300;

    private final RoomService roomService;
    private final TeamSlotRepository slotRepository;
    private final CommentaryGenerator generator;
    private final RatingService ratingService;
    private final TransactionTemplate readOnlyTx;

    /** key = inviteCode + ":" + boardHash. 접근 순서 LRU. */
    private final Map<String, CommentaryResponse> cache = new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, CommentaryResponse> eldest) {
            return size() > CACHE_MAX;
        }
    };

    public CommentaryService(RoomService roomService, TeamSlotRepository slotRepository,
                             CommentaryGenerator generator, RatingService ratingService,
                             PlatformTransactionManager transactionManager) {
        this.roomService = roomService;
        this.slotRepository = slotRepository;
        this.generator = generator;
        this.ratingService = ratingService;
        this.readOnlyTx = new TransactionTemplate(transactionManager);
        this.readOnlyTx.setReadOnly(true);
    }

    public AiStatusResponse status() {
        boolean enabled = generator.isEnabled();
        return new AiStatusResponse(enabled, enabled ? "deepseek" : null, enabled ? generator.modelName() : null);
    }

    public CommentaryResponse commentary(String inviteCode) {
        if (!generator.isEnabled()) {
            throw new ApiException(HttpStatus.CONFLICT, "AI_DISABLED", "AI 해설이 설정되지 않았습니다. (DEEPSEEK_API_KEY)");
        }

        Snapshot snapshot = readOnlyTx.execute(status -> loadSnapshot(inviteCode));
        String key = snapshot.inviteCode() + ":" + snapshot.boardHash();
        synchronized (cache) {
            CommentaryResponse hit = cache.get(key);
            if (hit != null) {
                return hit.asCached();
            }
        }

        String text = generator.generate(CommentaryPromptBuilder.SYSTEM_PROMPT, snapshot.userPrompt());
        CommentaryResponse fresh = new CommentaryResponse(text, snapshot.boardHash(), false, generator.modelName(), Instant.now());
        synchronized (cache) {
            cache.put(key, fresh);
        }
        return fresh;
    }

    /** 트랜잭션 안에서만 호출: 지연 로딩되는 캐릭터까지 읽어 프롬프트와 해시를 완성한다. */
    private Snapshot loadSnapshot(String inviteCode) {
        Room room = roomService.getByInviteCode(inviteCode);
        List<TeamSlot> slots = slotRepository.findAllByRoomId(room.getId());
        long filled = slots.stream().filter(s -> s.getCharacter() != null).count();
        if (filled < FULL_BOARD) {
            throw new BadRequestException("10자리가 모두 채워져야 장로가 해설할 수 있습니다. (현재 " + filled + "/10)");
        }
        List<PlayerCharacter> blue = slots.stream().filter(s -> s.getTeam() == Team.BLUE && s.getCharacter() != null).map(TeamSlot::getCharacter).toList();
        List<PlayerCharacter> red = slots.stream().filter(s -> s.getTeam() == Team.RED && s.getCharacter() != null).map(TeamSlot::getCharacter).toList();
        TeamBalance balance = TeamBalance.of(blue, red, ratingService.strengthFunction(room.getId()));
        return new Snapshot(room.getInviteCode(), CommentaryPromptBuilder.boardHash(slots),
                CommentaryPromptBuilder.userPrompt(room.getName(), slots, balance));
    }

    private record Snapshot(String inviteCode, String boardHash, String userPrompt) {
    }
}

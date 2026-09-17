package com.lolrank.match;

import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.PlayerCharacterRepository;
import com.lolrank.match.dto.RatingResponse;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.StrengthService;
import com.lolrank.team.balance.RatingCalculator;
import com.lolrank.team.balance.RatingCalculator.Rating;
import com.lolrank.team.balance.StrengthCalculator;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 방의 경기 기록을 재생해 선수별 보정치를 만들고, 밸런싱에 쓰는 실효 전투력 함수를 제공한다. */
@Service
public class RatingService {

    private final MatchRecordRepository matchRepository;
    private final PlayerCharacterRepository characterRepository;
    private final RoomService roomService;
    private final StrengthService strengthService;
    /** 꺼져 있으면 보정치는 항상 0 이고 실효 전투력 = 기본 전투력. (APP_RATING_ENABLED) */
    private final boolean enabled;

    public RatingService(MatchRecordRepository matchRepository, PlayerCharacterRepository characterRepository,
                         RoomService roomService, StrengthService strengthService,
                         @Value("${app.balance.rating-enabled:false}") boolean enabled) {
        this.matchRepository = matchRepository;
        this.characterRepository = characterRepository;
        this.roomService = roomService;
        this.strengthService = strengthService;
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** characterId → 보정치. 승패가 기록된 경기가 없으면 빈 맵. */
    @Transactional(readOnly = true)
    public Map<Long, Rating> ratings(Long roomId) {
        if (!enabled) {
            return Map.of();
        }
        List<RatingCalculator.MatchInput> inputs = matchRepository
                .findAllByRoomIdAndWinnerIsNotNullOrderByPlayedAtAscIdAsc(roomId).stream()
                .map(r -> new RatingCalculator.MatchInput(r.getWinner(), r.getSlots().stream()
                        .map(s -> new RatingCalculator.SlotInput(s.getTeam(), s.getCharacterId(), s.getStrength()))
                        .toList()))
                .toList();
        return RatingCalculator.replay(inputs);
    }

    /** 밸런싱용: 기본 전투력(계급·계급 안 순서 80% + 티어 20%) + (켜져 있으면) 기록 보정치. */
    @Transactional(readOnly = true)
    public ToIntFunction<PlayerCharacter> strengthFunction(Long roomId) {
        ToIntFunction<PlayerCharacter> base = strengthService.baseStrengthFunction(roomId);
        if (!enabled) {
            return base;
        }
        Map<Long, Rating> ratings = ratings(roomId);
        return c -> base.applyAsInt(c) + ratings.getOrDefault(c.getId(), Rating.NONE).delta();
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> list(String inviteCode) {
        Room room = roomService.getByInviteCode(inviteCode);
        Map<Long, Rating> ratings = ratings(room.getId());
        Map<Long, Integer> base = strengthService.baseStrengths(room.getId());
        return characterRepository.findAllByRoomIdOrderByIdAsc(room.getId()).stream()
                .map(c -> RatingResponse.from(c, ratings.getOrDefault(c.getId(), Rating.NONE),
                        base.getOrDefault(c.getId(), StrengthCalculator.strength(c))))
                .sorted(Comparator.comparingInt(RatingResponse::delta).reversed()
                        .thenComparing(RatingResponse::characterId))
                .toList();
    }
}

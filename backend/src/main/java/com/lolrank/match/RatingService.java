package com.lolrank.match;

import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.PlayerCharacterRepository;
import com.lolrank.match.dto.RatingResponse;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.balance.RatingCalculator;
import com.lolrank.team.balance.RatingCalculator.Rating;
import com.lolrank.team.balance.StrengthCalculator;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 방의 경기 기록을 재생해 선수별 보정치를 만들고, 밸런싱에 쓰는 실효 전투력 함수를 제공한다. */
@Service
public class RatingService {

    private final MatchRecordRepository matchRepository;
    private final PlayerCharacterRepository characterRepository;
    private final RoomService roomService;

    public RatingService(MatchRecordRepository matchRepository, PlayerCharacterRepository characterRepository,
                         RoomService roomService) {
        this.matchRepository = matchRepository;
        this.characterRepository = characterRepository;
        this.roomService = roomService;
    }

    /** characterId → 보정치. 승패가 기록된 경기가 없으면 빈 맵. */
    @Transactional(readOnly = true)
    public Map<Long, Rating> ratings(Long roomId) {
        List<RatingCalculator.MatchInput> inputs = matchRepository
                .findAllByRoomIdAndWinnerIsNotNullOrderByPlayedAtAscIdAsc(roomId).stream()
                .map(r -> new RatingCalculator.MatchInput(r.getWinner(), r.getSlots().stream()
                        .map(s -> new RatingCalculator.SlotInput(s.getTeam(), s.getCharacterId(), s.getStrength()))
                        .toList()))
                .toList();
        return RatingCalculator.replay(inputs);
    }

    /** 밸런싱용: 기본 전투력(계급 80% + 티어 20%) + 기록 보정치. */
    @Transactional(readOnly = true)
    public ToIntFunction<PlayerCharacter> strengthFunction(Long roomId) {
        Map<Long, Rating> ratings = ratings(roomId);
        return c -> StrengthCalculator.strength(c) + ratings.getOrDefault(c.getId(), Rating.NONE).delta();
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> list(String inviteCode) {
        Room room = roomService.getByInviteCode(inviteCode);
        Map<Long, Rating> ratings = ratings(room.getId());
        return characterRepository.findAllByRoomIdOrderByIdAsc(room.getId()).stream()
                .map(c -> RatingResponse.from(c, ratings.getOrDefault(c.getId(), Rating.NONE)))
                .sorted(Comparator.comparingInt(RatingResponse::delta).reversed()
                        .thenComparing(RatingResponse::characterId))
                .toList();
    }
}

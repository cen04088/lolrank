package com.lolrank.team;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.PlayerCharacterRepository;
import com.lolrank.team.balance.StrengthCalculator;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 방 단위 기본 전투력. 계급도 등급뿐 아니라 **같은 계급 안에서의 순서**까지 반영한다.
 * 계급 안에서 앞(왼쪽)에 있을수록 등급 점수가 높고, 맨 뒤는 {@link com.lolrank.team.balance.BalanceConfig#RANK_BAND_POINTS} 만큼 낮다.
 * 계급 사이 간격은 그대로라 계급도가 항상 우선한다.
 */
@Service
public class StrengthService {

    private final PlayerCharacterRepository characterRepository;

    public StrengthService(PlayerCharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    /** characterId → 기본 전투력 (×100). 방의 모든 캐릭터를 계급·순서로 정렬해 계산한다. */
    @Transactional(readOnly = true)
    public Map<Long, Integer> baseStrengths(Long roomId) {
        List<PlayerCharacter> all = characterRepository.findAllByRoomIdOrderByIdAsc(roomId);
        Map<HierarchyRank, List<PlayerCharacter>> byRank = new EnumMap<>(HierarchyRank.class);
        for (PlayerCharacter c : all) {
            byRank.computeIfAbsent(c.getHierarchyRank(), k -> new java.util.ArrayList<>()).add(c);
        }
        Map<Long, Integer> result = new HashMap<>();
        for (Map.Entry<HierarchyRank, List<PlayerCharacter>> e : byRank.entrySet()) {
            List<PlayerCharacter> members = e.getValue();
            members.sort(Comparator.comparingInt(PlayerCharacter::getHierarchyOrder).thenComparing(PlayerCharacter::getId));
            for (int i = 0; i < members.size(); i++) {
                PlayerCharacter c = members.get(i);
                result.put(c.getId(), StrengthCalculator.strength(e.getKey(), i, members.size(), c.getTier(), c.getDivision()));
            }
        }
        return result;
    }

    /** 밸런싱용 함수. 방에 없는(모르는) 캐릭터는 계급 맨 앞 기준으로 계산한다. */
    @Transactional(readOnly = true)
    public ToIntFunction<PlayerCharacter> baseStrengthFunction(Long roomId) {
        Map<Long, Integer> map = baseStrengths(roomId);
        return c -> map.getOrDefault(c.getId(), StrengthCalculator.strength(c));
    }
}

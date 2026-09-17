package com.lolrank.match.dto;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.character.TierLabel;
import com.lolrank.match.MatchRecord;
import com.lolrank.match.MatchRecordSlot;
import com.lolrank.team.Team;
import com.lolrank.team.balance.BalanceGrade;
import java.time.Instant;
import java.util.List;

public record MatchResponse(
        Long id,
        Instant playedAt,
        Team winner,
        String note,
        String recordedBy,
        int blueScore,
        int redScore,
        int difference,
        BalanceGrade grade,
        List<SlotSnapshot> slots
) {

    public record SlotSnapshot(
            Team team,
            Position position,
            Long characterId,
            String characterName,
            String title,
            String assetKey,
            HierarchyRank hierarchyRank,
            Tier tier,
            Integer division,
            String tierLabel,
            /** 기록 당시 전투력 (0~100 표시 단위) */
            int strength
    ) {
        static SlotSnapshot from(MatchRecordSlot s) {
            return new SlotSnapshot(s.getTeam(), s.getPosition(), s.getCharacterId(), s.getCharacterName(), s.getTitle(),
                    s.getAssetKey(), s.getHierarchyRank(), s.getTier(), s.getDivision(),
                    TierLabel.of(s.getTier(), s.getDivision()), (int) Math.round(s.getStrength() / 100.0));
        }
    }

    public static MatchResponse from(MatchRecord r) {
        return new MatchResponse(
                r.getId(), r.getPlayedAt(), r.getWinner(), r.getNote(), r.getRecordedBy(),
                r.getBlueScore(), r.getRedScore(), r.getDifference(), r.getGrade(),
                r.getSlots().stream().map(SlotSnapshot::from).toList()
        );
    }
}

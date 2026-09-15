package com.lolrank.character.dto;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.character.TierLabel;
import java.time.Instant;

public record CharacterResponse(
        Long id,
        Long roomId,
        String name,
        String description,
        String assetKey,
        Tier tier,
        Integer division,
        String tierLabel,
        Position mainPosition,
        Position subPosition,
        HierarchyRank hierarchyRank,
        int hierarchyOrder,
        Instant createdAt,
        Instant updatedAt
) {

    public static CharacterResponse from(PlayerCharacter c) {
        return new CharacterResponse(
                c.getId(),
                c.getRoom().getId(),
                c.getName(),
                c.getDescription(),
                c.getAssetKey(),
                c.getTier(),
                c.getDivision(),
                TierLabel.of(c.getTier(), c.getDivision()),
                c.getMainPosition(),
                c.getSubPosition(),
                c.getHierarchyRank(),
                c.getHierarchyOrder(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}

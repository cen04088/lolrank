package com.lolrank.character.dto;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.character.TierLabel;
import java.time.Instant;
import java.util.List;

public record CharacterResponse(
        Long id,
        Long roomId,
        String name,
        String description,
        String title,
        String assetKey,
        Tier tier,
        Integer division,
        String tierLabel,
        Position mainPosition,
        List<Position> subPositions,
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
                c.getTitle(),
                c.getAssetKey(),
                c.getTier(),
                c.getDivision(),
                TierLabel.of(c.getTier(), c.getDivision()),
                c.getMainPosition(),
                c.getSubPositions(),
                c.getHierarchyRank(),
                c.getHierarchyOrder(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}

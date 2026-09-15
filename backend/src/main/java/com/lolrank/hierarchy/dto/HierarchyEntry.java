package com.lolrank.hierarchy.dto;

import com.lolrank.character.HierarchyRank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record HierarchyEntry(
        @NotNull(message = "characterId 는 필수입니다.") Long characterId,
        @NotNull(message = "rank 는 필수입니다.") HierarchyRank rank,
        @Min(value = 0, message = "order 는 0 이상이어야 합니다.") int order
) {
}

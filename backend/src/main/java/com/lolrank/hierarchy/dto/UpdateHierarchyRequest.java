package com.lolrank.hierarchy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateHierarchyRequest(
        @NotNull(message = "entries 가 필요합니다.")
        @Valid
        List<HierarchyEntry> entries
) {
}

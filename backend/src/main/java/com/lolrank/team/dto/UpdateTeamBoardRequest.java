package com.lolrank.team.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** 보드 전체를 교체한다. 목록에 없는 슬롯은 비운다. */
public record UpdateTeamBoardRequest(
        @NotNull(message = "slots 가 필요합니다.")
        @Valid
        List<SlotRequest> slots
) {
}

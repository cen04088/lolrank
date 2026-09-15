package com.lolrank.team.dto;

import com.lolrank.character.Position;
import com.lolrank.team.AssignmentSource;
import com.lolrank.team.Team;
import jakarta.validation.constraints.NotNull;

/** characterId 가 null 이면 빈 슬롯. source 가 null 이면 MANUAL 로 간주한다. */
public record SlotRequest(
        @NotNull(message = "team 은 필수입니다.") Team team,
        @NotNull(message = "position 은 필수입니다.") Position position,
        Long characterId,
        AssignmentSource source
) {
}

package com.lolrank.team.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateParticipantsRequest(
        @NotNull(message = "참가자 목록이 필요합니다.")
        @Size(max = 10, message = "오늘의 참가자는 최대 10명까지 선택할 수 있습니다.")
        List<Long> characterIds
) {
}

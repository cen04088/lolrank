package com.lolrank.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @NotBlank(message = "방 이름을 입력해주세요.")
        @Size(max = 40, message = "방 이름은 40자 이하여야 합니다.")
        String name
) {
}

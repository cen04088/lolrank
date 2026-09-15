package com.lolrank.character.dto;

import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCharacterRequest(
        @NotBlank(message = "캐릭터 이름을 입력해주세요.")
        @Size(max = 20, message = "캐릭터 이름은 20자 이하여야 합니다.")
        String name,

        @Size(max = 100, message = "설명은 100자 이하여야 합니다.")
        String description,

        @NotBlank(message = "캐릭터 이미지를 선택해주세요.")
        @Size(max = 40, message = "assetKey 가 너무 깁니다.")
        String assetKey,

        @NotNull(message = "티어를 선택해주세요.")
        Tier tier,

        @Min(value = 1, message = "Division 은 1~4 사이여야 합니다.")
        @Max(value = 4, message = "Division 은 1~4 사이여야 합니다.")
        Integer division,

        @NotNull(message = "주 포지션을 선택해주세요.")
        Position mainPosition,

        Position subPosition
) {
}

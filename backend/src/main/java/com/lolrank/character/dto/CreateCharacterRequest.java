package com.lolrank.character.dto;

import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateCharacterRequest(
        @NotBlank(message = "캐릭터 이름을 입력해주세요.")
        @Size(max = 20, message = "캐릭터 이름은 20자 이하여야 합니다.")
        String name,

        @Size(max = 100, message = "설명은 100자 이하여야 합니다.")
        String description,

        /** 칭호 (선택, 이름 옆에 표시) */
        @Size(max = 20, message = "칭호는 20자 이하여야 합니다.")
        String title,

        /** 주로 하는 챔피언 (선택, 쉼표 구분) */
        @Size(max = 60, message = "주 챔피언은 60자 이하여야 합니다.")
        String champions,

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

        /** 부 포지션 (여러 개, 없으면 빈 목록/null) */
        @Size(max = 4, message = "부 포지션은 최대 4개입니다.")
        List<Position> subPositions
) {
}

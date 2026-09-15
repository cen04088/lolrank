package com.lolrank.character.dto;

import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** PATCH 용. null 인 필드는 변경하지 않는다. subPosition 은 clearSubPosition=true 로 명시적으로 지운다. */
public record UpdateCharacterRequest(
        @Size(min = 1, max = 20, message = "캐릭터 이름은 1~20자여야 합니다.")
        String name,

        @Size(max = 100, message = "설명은 100자 이하여야 합니다.")
        String description,

        @Size(min = 1, max = 40, message = "assetKey 가 올바르지 않습니다.")
        String assetKey,

        Tier tier,

        @Min(value = 1, message = "Division 은 1~4 사이여야 합니다.")
        @Max(value = 4, message = "Division 은 1~4 사이여야 합니다.")
        Integer division,

        Position mainPosition,

        Position subPosition,

        Boolean clearSubPosition
) {
}

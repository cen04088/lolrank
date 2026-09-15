package com.lolrank.character.dto;

import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

/** PATCH 용. null 인 필드는 변경하지 않는다. subPositions 는 빈 목록([])을 보내면 모두 지운다. */
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

        @Size(max = 4, message = "부 포지션은 최대 4개입니다.")
        List<Position> subPositions
) {
}

package com.lolrank.match.dto;

import com.lolrank.team.Team;
import jakarta.validation.constraints.Size;

/**
 * 결과 수정. winner 는 항상 이 값으로 덮어쓴다 (null 이면 '미정'으로 되돌림).
 * note 는 null 이면 그대로 두고, 빈 문자열이면 지운다.
 */
public record UpdateMatchRequest(
        Team winner,

        @Size(max = 100, message = "메모는 100자 이하여야 합니다.")
        String note
) {
}

package com.lolrank.match.dto;

import com.lolrank.team.Team;
import jakarta.validation.constraints.Size;

/**
 * 현재 팀 보드를 경기 기록으로 남긴다.
 *
 * @param winner 승리 팀 (아직 모르면 null)
 * @param note   메모 (선택)
 */
public record RecordMatchRequest(
        Team winner,

        @Size(max = 100, message = "메모는 100자 이하여야 합니다.")
        String note
) {
}

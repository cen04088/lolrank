package com.lolrank.team.dto;

import java.util.List;

public record TeamBoardResponse(List<Long> participantIds, List<SlotResponse> slots, BalanceResponse balance) {
}

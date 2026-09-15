package com.lolrank.team.dto;

import com.lolrank.team.balance.BalanceGrade;
import com.lolrank.team.balance.TeamBalance;

public record BalanceResponse(
        int blueScore,
        int redScore,
        int difference,
        BalanceGrade grade,
        String message,
        int blueCount,
        int redCount,
        String blueAverageTier,
        String redAverageTier,
        int bluePower,
        int redPower
) {

    public static BalanceResponse from(TeamBalance balance) {
        return new BalanceResponse(
                balance.blueScore(),
                balance.redScore(),
                balance.difference(),
                balance.grade(),
                balance.grade().getMessage(),
                balance.blueCount(),
                balance.redCount(),
                balance.blueAverageTier(),
                balance.redAverageTier(),
                balance.bluePower(),
                balance.redPower()
        );
    }
}

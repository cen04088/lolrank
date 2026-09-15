package com.lolrank.team.balance;

import com.lolrank.character.Position;

/** 캐릭터가 특정 포지션에 얼마나 맞는지. */
public enum PositionFit {
    MAIN(BalanceConfig.MAIN_POSITION_PENALTY),
    SUB(BalanceConfig.SUB_POSITION_PENALTY),
    OFF(BalanceConfig.OFF_POSITION_PENALTY);

    private final int penalty;

    PositionFit(int penalty) {
        this.penalty = penalty;
    }

    public int getPenalty() {
        return penalty;
    }

    public static PositionFit of(Position mainPosition, Position subPosition, Position target) {
        if (target == mainPosition) {
            return MAIN;
        }
        if (subPosition != null && target == subPosition) {
            return SUB;
        }
        return OFF;
    }

    public static int penalty(Position mainPosition, Position subPosition, Position target) {
        return of(mainPosition, subPosition, target).getPenalty();
    }
}

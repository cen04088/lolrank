package com.lolrank.team.balance;

import com.lolrank.character.Position;
import java.util.List;

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

    public static PositionFit of(Position mainPosition, List<Position> subPositions, Position target) {
        if (target == mainPosition) {
            return MAIN;
        }
        if (subPositions != null && subPositions.contains(target)) {
            return SUB;
        }
        return OFF;
    }

    public static int penalty(Position mainPosition, List<Position> subPositions, Position target) {
        return of(mainPosition, subPositions, target).getPenalty();
    }
}

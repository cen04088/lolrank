package com.lolrank.team.balance;

/**
 * 자동배정 방식. 가중치만 다르고 탐색 알고리즘은 같다. RANDOM 은 탐색 없이 무작위 배치.
 * 값은 {@link BalanceConfig} 에서 조정한다.
 */
public enum AutoFillMode {

    /** 실력 균형 우선 (기본). 포지션은 보조 기준. */
    SKILL_BALANCE(BalanceConfig.RANK_BALANCE_WEIGHT,
            BalanceConfig.SUB_POSITION_PENALTY,
            BalanceConfig.OFF_POSITION_PENALTY),

    /** 포지션 적합도 우선. 실력 차이는 보조 기준. */
    POSITION_BALANCE(BalanceConfig.POSITION_MODE_RANK_BALANCE_WEIGHT,
            BalanceConfig.POSITION_MODE_SUB_POSITION_PENALTY,
            BalanceConfig.POSITION_MODE_OFF_POSITION_PENALTY),

    /** 완전 랜덤. 실력/포지션을 보지 않는다. */
    RANDOM(0, 0, 0);

    private final int rankBalanceWeight;
    private final int subPositionPenalty;
    private final int offPositionPenalty;

    AutoFillMode(int rankBalanceWeight, int subPositionPenalty, int offPositionPenalty) {
        this.rankBalanceWeight = rankBalanceWeight;
        this.subPositionPenalty = subPositionPenalty;
        this.offPositionPenalty = offPositionPenalty;
    }

    public int getRankBalanceWeight() {
        return rankBalanceWeight;
    }

    public int penaltyOf(PositionFit fit) {
        return switch (fit) {
            case MAIN -> BalanceConfig.MAIN_POSITION_PENALTY;
            case SUB -> subPositionPenalty;
            case OFF -> offPositionPenalty;
        };
    }

    public boolean isRandom() {
        return this == RANDOM;
    }
}

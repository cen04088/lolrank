package com.lolrank.team.balance;

public enum BalanceGrade {
    PERFECT("완벽에 가까운 밸런스!"),
    VERY_GOOD("매우 균형적인 매치!"),
    GOOD("충분히 해볼 만한 매치!"),
    WARNING("한쪽 팀이 조금 강합니다."),
    UNBALANCED("팀 밸런스 차이가 큽니다!");

    private final String message;

    BalanceGrade(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public static BalanceGrade of(int difference) {
        int diff = Math.abs(difference);
        if (diff <= BalanceConfig.PERFECT_MAX_DIFFERENCE) {
            return PERFECT;
        }
        if (diff <= BalanceConfig.VERY_GOOD_MAX_DIFFERENCE) {
            return VERY_GOOD;
        }
        if (diff <= BalanceConfig.GOOD_MAX_DIFFERENCE) {
            return GOOD;
        }
        if (diff <= BalanceConfig.WARNING_MAX_DIFFERENCE) {
            return WARNING;
        }
        return UNBALANCED;
    }
}

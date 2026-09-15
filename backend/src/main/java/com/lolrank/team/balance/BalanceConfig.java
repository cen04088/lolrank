package com.lolrank.team.balance;

import com.lolrank.character.Tier;
import java.util.Map;

/**
 * 팀 밸런싱 알고리즘에 쓰이는 모든 상수.
 * 값을 바꾸고 싶을 때는 이 파일만 수정하면 된다. UI 에는 이 숫자를 직접 노출하지 않는다.
 */
public final class BalanceConfig {

    private BalanceConfig() {
    }

    /** 두 팀 실력 합계 차이 1점당 비용 가중치. */
    public static final int RANK_BALANCE_WEIGHT = 3;

    /** 포지션 적합도 페널티. */
    public static final int MAIN_POSITION_PENALTY = 0;
    public static final int SUB_POSITION_PENALTY = 8;
    public static final int OFF_POSITION_PENALTY = 25;

    /**
     * 티어별 skill score. 배열 인덱스 = division - 1 (index 0 = I, index 3 = IV).
     * 예: GOLD IV = 40, GOLD I = 46
     */
    public static final Map<Tier, int[]> DIVISION_SCORES = Map.of(
            Tier.IRON, new int[]{16, 14, 12, 10},
            Tier.BRONZE, new int[]{26, 24, 22, 20},
            Tier.SILVER, new int[]{36, 34, 32, 30},
            Tier.GOLD, new int[]{46, 44, 42, 40},
            Tier.PLATINUM, new int[]{56, 54, 52, 50},
            Tier.EMERALD, new int[]{66, 64, 62, 60},
            Tier.DIAMOND, new int[]{79, 76, 73, 70}
    );

    /** division 이 없는 상위 티어 점수. */
    public static final Map<Tier, Integer> APEX_SCORES = Map.of(
            Tier.MASTER, 85,
            Tier.GRANDMASTER, 92,
            Tier.CHALLENGER, 100
    );

    /** Balance Grade 기준 (두 팀 실력 합계 차이). */
    public static final int PERFECT_MAX_DIFFERENCE = 2;
    public static final int VERY_GOOD_MAX_DIFFERENCE = 5;
    public static final int GOOD_MAX_DIFFERENCE = 10;
    public static final int WARNING_MAX_DIFFERENCE = 15;
}

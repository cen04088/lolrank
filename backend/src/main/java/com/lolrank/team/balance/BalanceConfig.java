package com.lolrank.team.balance;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.Tier;
import java.util.Map;

/**
 * 팀 밸런싱 알고리즘에 쓰이는 모든 상수.
 * 값을 바꾸고 싶을 때는 이 파일만 수정하면 된다.
 */
public final class BalanceConfig {

    private BalanceConfig() {
    }

    // ---------------------------------------------------------------- 전투력 구성 비율 (합 100)

    /** 계급도 등급(LEGEND~C) 비중 %. */
    public static final int HIERARCHY_WEIGHT = 80;
    /** 롤 티어 점수 + 포지션 적합도 비중 %. */
    public static final int SKILL_WEIGHT = 20;

    /**
     * 같은 계급 안에서 순서에 따라 나뉘는 점수 폭. 계급 맨 앞 = RANK_SCORES 값, 맨 뒤 = 그 값 − RANK_BAND_POINTS.
     * 계급 사이 간격(20)보다 작아 아래 계급 1위가 위 계급 꼴찌를 넘지 못한다.
     */
    public static final int RANK_BAND_POINTS = 10;

    /** 계급도 등급 점수 (0~100). 계급 맨 앞 기준값. */
    public static final Map<HierarchyRank, Integer> RANK_SCORES = Map.of(
            HierarchyRank.LEGEND, 100,
            HierarchyRank.S, 80,
            HierarchyRank.A, 60,
            HierarchyRank.B, 40,
            HierarchyRank.C, 20
    );

    // ---------------------------------------------------------------- 경기 기록 보정 (레이팅)
    // 승패가 기록된 경기를 시간순으로 재생해 선수마다 보정치를 만든다 (RatingCalculator).
    // 실효 전투력 = 기본 전투력(등급 80% + 티어 20%) + 보정치.

    /** 한 경기당 선수별 최대 변동 (표시 점수). 대등한 경기를 이기면 절반(+1)이 오르고, 팀 합계는 경기당 최대 5점 움직인다. */
    public static final int RATING_K_POINTS = 2;
    /** 두 팀 합계 차이가 이 값이면 강한 팀 예상 승률 약 91% (10:1). */
    public static final int RATING_SCALE_POINTS = 40;
    /** 선수별 보정치 상한. 등급 한 단계(16점)의 절반이라 계급도가 항상 우선한다. */
    public static final int RATING_MAX_ABS_POINTS = 8;

    // ---------------------------------------------------------------- 균형 모드 (기본)

    /** 두 팀 전투력 합계 차이 1단위당 비용 가중치. */
    public static final int RANK_BALANCE_WEIGHT = 3;

    /** 포지션 적합도 페널티 (티어 점수와 같은 0~100 척도). */
    public static final int MAIN_POSITION_PENALTY = 0;
    public static final int SUB_POSITION_PENALTY = 8;
    public static final int OFF_POSITION_PENALTY = 25;

    // ---------------------------------------------------------------- 포지션 균형 모드

    /** 포지션을 우선하되 전투력 차이도 약하게 반영한다. */
    public static final int POSITION_MODE_RANK_BALANCE_WEIGHT = 1;
    public static final int POSITION_MODE_SUB_POSITION_PENALTY = 20;
    public static final int POSITION_MODE_OFF_POSITION_PENALTY = 80;

    // ---------------------------------------------------------------- 티어 점수

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

    // ---------------------------------------------------------------- Balance Grade
    // 기준: 두 팀 전투력 합계 차이 (화면 단위, 0~100 척도).
    // 한 명의 등급 한 단계(예 B→A) = 16점, 티어 한 디비전 = 0.4점.

    public static final int PERFECT_MAX_DIFFERENCE = 4;
    public static final int VERY_GOOD_MAX_DIFFERENCE = 10;
    public static final int GOOD_MAX_DIFFERENCE = 20;
    public static final int WARNING_MAX_DIFFERENCE = 35;
}

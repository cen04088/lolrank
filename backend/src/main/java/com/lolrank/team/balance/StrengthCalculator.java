package com.lolrank.team.balance;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Tier;

/**
 * 캐릭터 전투력 = 계급도 등급 80% + 롤 티어 20%.
 *
 * <p>정수 연산을 위해 내부 단위는 "포인트 × 100" 이다. 예) LEGEND + Gold IV
 * = 80 × 100 + 20 × 40 = 8800 → 화면에는 88 로 보인다.
 * 포지션 페널티도 티어와 같은 20% 몫으로 깎는다.
 */
public final class StrengthCalculator {

    private StrengthCalculator() {
    }

    /** 등급 점수 (0~100). */
    public static int rankScore(HierarchyRank rank) {
        return BalanceConfig.RANK_SCORES.get(rank);
    }

    /** 전투력 (×100 단위). */
    public static int strength(HierarchyRank rank, Tier tier, Integer division) {
        return BalanceConfig.HIERARCHY_WEIGHT * rankScore(rank)
                + BalanceConfig.SKILL_WEIGHT * SkillScoreCalculator.score(tier, division);
    }

    public static int strength(PlayerCharacter character) {
        return strength(character.getHierarchyRank(), character.getTier(), character.getDivision());
    }

    /** 포지션 페널티를 전투력 단위(×100)로 환산한다. */
    public static int positionCost(int penalty) {
        return BalanceConfig.SKILL_WEIGHT * penalty;
    }

    /** ×100 단위를 화면용 0~100 점수로. */
    public static int toDisplay(int strengthPoints) {
        return (int) Math.round(strengthPoints / 100.0);
    }

    /** 평균 등급 점수와 가장 가까운 등급 표기. */
    public static HierarchyRank nearestRank(double averageRankScore) {
        HierarchyRank best = HierarchyRank.C;
        double bestDistance = Double.MAX_VALUE;
        for (HierarchyRank rank : HierarchyRank.values()) {
            double distance = Math.abs(rankScore(rank) - averageRankScore);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = rank;
            }
        }
        return best;
    }
}

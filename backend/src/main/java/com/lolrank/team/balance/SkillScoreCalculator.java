package com.lolrank.team.balance;

import com.lolrank.character.Division;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Tier;
import com.lolrank.character.TierLabel;

/** 롤 티어 → 내부 skill score. DB 에 저장하지 않고 런타임에 계산한다. */
public final class SkillScoreCalculator {

    private SkillScoreCalculator() {
    }

    public static int score(Tier tier, Integer division) {
        if (tier.hasDivision()) {
            if (!Division.isValid(division)) {
                throw new IllegalArgumentException(tier + " 티어는 division(1~4)이 필요합니다.");
            }
            return BalanceConfig.DIVISION_SCORES.get(tier)[division - 1];
        }
        return BalanceConfig.APEX_SCORES.get(tier);
    }

    public static int score(PlayerCharacter character) {
        return score(character.getTier(), character.getDivision());
    }

    /** 평균 점수와 가장 가까운 티어 표기를 돌려준다. 예: 43.2 → "Gold III" */
    public static String nearestTierLabel(double averageScore) {
        String bestLabel = null;
        double bestDistance = Double.MAX_VALUE;
        for (Tier tier : Tier.values()) {
            if (tier.hasDivision()) {
                for (int division = Division.LOWEST; division >= Division.HIGHEST; division--) {
                    double distance = Math.abs(score(tier, division) - averageScore);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestLabel = TierLabel.of(tier, division);
                    }
                }
            } else {
                double distance = Math.abs(score(tier, null) - averageScore);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestLabel = TierLabel.of(tier, null);
                }
            }
        }
        return bestLabel;
    }
}

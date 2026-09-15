package com.lolrank.team.balance;

import com.lolrank.character.PlayerCharacter;
import java.util.List;

/** 현재 보드 기준 두 팀의 실력 합계와 등급. */
public record TeamBalance(
        int blueScore,
        int redScore,
        int difference,
        BalanceGrade grade,
        int blueCount,
        int redCount,
        String blueAverageTier,
        String redAverageTier,
        int bluePower,
        int redPower
) {

    public static TeamBalance of(List<PlayerCharacter> blue, List<PlayerCharacter> red) {
        int blueScore = sum(blue);
        int redScore = sum(red);
        int difference = Math.abs(blueScore - redScore);
        return new TeamBalance(
                blueScore,
                redScore,
                difference,
                BalanceGrade.of(difference),
                blue.size(),
                red.size(),
                averageLabel(blueScore, blue.size()),
                averageLabel(redScore, red.size()),
                power(blueScore, blue.size()),
                power(redScore, red.size())
        );
    }

    private static int sum(List<PlayerCharacter> characters) {
        return characters.stream().mapToInt(SkillScoreCalculator::score).sum();
    }

    /** 팀 평균 실력 (0~100). UI 의 TEAM POWER 표시용. */
    private static int power(int total, int count) {
        return count == 0 ? 0 : (int) Math.round((double) total / count);
    }

    private static String averageLabel(int total, int count) {
        if (count == 0) {
            return null;
        }
        return SkillScoreCalculator.nearestTierLabel((double) total / count);
    }
}

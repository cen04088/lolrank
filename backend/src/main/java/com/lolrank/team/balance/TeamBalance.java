package com.lolrank.team.balance;

import com.lolrank.character.PlayerCharacter;
import java.util.List;
import java.util.function.ToIntFunction;

/**
 * 현재 보드 기준 두 팀의 전투력 합계와 등급.
 * blueScore/redScore/difference 는 화면 단위(캐릭터당 0~100)의 합계이고,
 * 전투력 = 계급도 등급 80% + 티어 20% 이다 ({@link StrengthCalculator}).
 */
public record TeamBalance(
        int blueScore,
        int redScore,
        int difference,
        BalanceGrade grade,
        int blueCount,
        int redCount,
        String blueAverageTier,
        String redAverageTier,
        String blueAverageRank,
        String redAverageRank,
        int bluePower,
        int redPower
) {

    /** 기본 전투력만으로 (기록 보정 없이) */
    public static TeamBalance of(List<PlayerCharacter> blue, List<PlayerCharacter> red) {
        return of(blue, red, StrengthCalculator::strength);
    }

    /** strengthFn 은 ×100 단위 실효 전투력 (기본 + 기록 보정) */
    public static TeamBalance of(List<PlayerCharacter> blue, List<PlayerCharacter> red, ToIntFunction<PlayerCharacter> strengthFn) {
        int bluePoints = strengthSum(blue, strengthFn);
        int redPoints = strengthSum(red, strengthFn);
        int blueScore = StrengthCalculator.toDisplay(bluePoints);
        int redScore = StrengthCalculator.toDisplay(redPoints);
        int difference = Math.abs(blueScore - redScore);
        return new TeamBalance(
                blueScore,
                redScore,
                difference,
                BalanceGrade.of(difference),
                blue.size(),
                red.size(),
                averageTierLabel(blue),
                averageTierLabel(red),
                averageRankLabel(blue),
                averageRankLabel(red),
                power(bluePoints, blue.size()),
                power(redPoints, red.size())
        );
    }

    private static int strengthSum(List<PlayerCharacter> characters, ToIntFunction<PlayerCharacter> strengthFn) {
        return characters.stream().mapToInt(strengthFn).sum();
    }

    /** 팀 평균 전투력 (0~100). UI 의 TEAM POWER. */
    private static int power(int totalPoints, int count) {
        return count == 0 ? 0 : (int) Math.round(totalPoints / 100.0 / count);
    }

    private static String averageTierLabel(List<PlayerCharacter> characters) {
        if (characters.isEmpty()) {
            return null;
        }
        double average = characters.stream().mapToInt(SkillScoreCalculator::score).average().orElse(0);
        return SkillScoreCalculator.nearestTierLabel(average);
    }

    private static String averageRankLabel(List<PlayerCharacter> characters) {
        if (characters.isEmpty()) {
            return null;
        }
        double average = characters.stream()
                .mapToInt(c -> StrengthCalculator.rankScore(c.getHierarchyRank()))
                .average()
                .orElse(0);
        return StrengthCalculator.nearestRank(average).name();
    }
}

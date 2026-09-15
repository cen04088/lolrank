package com.lolrank.character;

/** UI 에 노출되는 티어 표기. 예: "Gold IV", "Master" */
public final class TierLabel {

    private TierLabel() {
    }

    public static String of(Tier tier, Integer division) {
        if (tier.hasDivision() && Division.isValid(division)) {
            return tier.getDisplayName() + " " + Division.toRoman(division);
        }
        return tier.getDisplayName();
    }
}

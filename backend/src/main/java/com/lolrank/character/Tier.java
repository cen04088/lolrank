package com.lolrank.character;

public enum Tier {
    IRON("Iron"),
    BRONZE("Bronze"),
    SILVER("Silver"),
    GOLD("Gold"),
    PLATINUM("Platinum"),
    EMERALD("Emerald"),
    DIAMOND("Diamond"),
    MASTER("Master"),
    GRANDMASTER("Grandmaster"),
    CHALLENGER("Challenger");

    private final String displayName;

    Tier(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /** IRON ~ DIAMOND 는 division(1~4)을 가진다. MASTER 이상은 division 이 없다. */
    public boolean hasDivision() {
        return this.ordinal() <= DIAMOND.ordinal();
    }
}

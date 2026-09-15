package com.lolrank.character;

public final class Division {

    public static final int HIGHEST = 1;
    public static final int LOWEST = 4;
    private static final String[] ROMAN = {"I", "II", "III", "IV"};

    private Division() {
    }

    public static boolean isValid(Integer division) {
        return division != null && division >= HIGHEST && division <= LOWEST;
    }

    public static String toRoman(int division) {
        return ROMAN[division - 1];
    }
}

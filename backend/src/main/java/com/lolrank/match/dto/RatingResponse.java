package com.lolrank.match.dto;

import com.lolrank.character.PlayerCharacter;
import com.lolrank.team.balance.RatingCalculator.Rating;
import com.lolrank.team.balance.StrengthCalculator;

/**
 * 선수별 기록 보정치.
 *
 * @param delta        보정치 (표시 단위, 예 +3 / -2). 기본 전투력에 더해진다
 * @param baseStrength 기본 전투력 (계급 80% + 티어 20%, 0~100)
 * @param strength     실효 전투력 = 기본 + 보정
 * @param played       승패가 기록된 경기 수
 */
public record RatingResponse(
        Long characterId,
        String characterName,
        int delta,
        int baseStrength,
        int strength,
        int played,
        int wins,
        int losses,
        /** 0~100, 경기가 없으면 null */
        Integer winRate
) {

    public static RatingResponse from(PlayerCharacter c, Rating rating, int base) {
        int effective = base + rating.delta();
        Integer winRate = rating.played() == 0 ? null : (int) Math.round(100.0 * rating.wins() / rating.played());
        return new RatingResponse(c.getId(), c.getName(), rating.deltaPoints(),
                StrengthCalculator.toDisplay(base), StrengthCalculator.toDisplay(effective),
                rating.played(), rating.wins(), rating.losses(), winRate);
    }
}

package com.lolrank.team.balance;

import com.lolrank.team.Team;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 경기 기록(승패)으로 선수별 보정치를 계산한다. Elo 방식의 팀 버전.
 *
 * <p>기록을 시간순으로 재생하면서, 각 경기의 예상 승률을 두 팀의 (기본 전투력 + 보정치) 합계 차이로 구하고
 * 결과와의 차이만큼 이긴 팀 선수 전원에게 +, 진 팀 전원에게 - 를 준다.
 * 보정치는 ±{@link BalanceConfig#RATING_MAX_ABS_POINTS} 점(표시 단위) 안에 머물러 계급도 등급을 뒤집지 않는다.
 *
 * <p>입력 전투력·출력 보정치는 모두 {@link StrengthCalculator} 의 ×100 단위다.
 */
public final class RatingCalculator {

    private RatingCalculator() {
    }

    /** 한 경기의 한 자리 (기록 당시 기본 전투력, ×100). 삭제된 캐릭터는 characterId 가 null 이라 제외한다. */
    public record SlotInput(Team team, Long characterId, int baseStrength) {
    }

    /** 승패가 확정된 경기 하나 */
    public record MatchInput(Team winner, List<SlotInput> slots) {
    }

    /**
     * @param delta  보정치 (×100 단위, 양수면 기록보다 강함)
     * @param played 승패가 기록된 경기 수
     * @param wins   승리 수
     */
    public record Rating(int delta, int played, int wins) {
        public static final Rating NONE = new Rating(0, 0, 0);

        public int losses() {
            return played - wins;
        }

        /** 표시용 정수 점수 (예: +3, -2) */
        public int deltaPoints() {
            return (int) Math.round(delta / 100.0);
        }
    }

    /** 시간순 경기 목록을 재생해 선수별 보정치를 낸다. */
    public static Map<Long, Rating> replay(List<MatchInput> matches) {
        Map<Long, Rating> ratings = new HashMap<>();
        int maxAbs = BalanceConfig.RATING_MAX_ABS_POINTS * 100;
        double scale = BalanceConfig.RATING_SCALE_POINTS * 100.0;
        double k = BalanceConfig.RATING_K_POINTS * 100.0;

        for (MatchInput match : matches) {
            if (match.winner() == null) {
                continue;
            }
            double blue = 0;
            double red = 0;
            for (SlotInput slot : match.slots()) {
                if (slot.characterId() == null) continue;
                int strength = slot.baseStrength() + ratings.getOrDefault(slot.characterId(), Rating.NONE).delta();
                if (slot.team() == Team.BLUE) blue += strength; else red += strength;
            }
            double expectedBlue = 1.0 / (1.0 + Math.pow(10, (red - blue) / scale));
            double resultBlue = match.winner() == Team.BLUE ? 1.0 : 0.0;
            int change = (int) Math.round(k * (resultBlue - expectedBlue));

            for (SlotInput slot : match.slots()) {
                if (slot.characterId() == null) continue;
                Rating current = ratings.getOrDefault(slot.characterId(), Rating.NONE);
                int signed = slot.team() == Team.BLUE ? change : -change;
                int next = Math.max(-maxAbs, Math.min(maxAbs, current.delta() + signed));
                boolean won = slot.team() == match.winner();
                ratings.put(slot.characterId(), new Rating(next, current.played() + 1, current.wins() + (won ? 1 : 0)));
            }
        }
        return ratings;
    }

    /** 두 팀 기본 전투력 합계로 본 BLUE 예상 승률 (0~1) */
    public static double expectedBlueWinRate(int blueStrength, int redStrength) {
        return 1.0 / (1.0 + Math.pow(10, (redStrength - blueStrength) / (BalanceConfig.RATING_SCALE_POINTS * 100.0)));
    }
}

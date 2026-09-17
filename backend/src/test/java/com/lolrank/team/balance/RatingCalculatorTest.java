package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;

import com.lolrank.team.Team;
import com.lolrank.team.balance.RatingCalculator.MatchInput;
import com.lolrank.team.balance.RatingCalculator.Rating;
import com.lolrank.team.balance.RatingCalculator.SlotInput;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RatingCalculatorTest {

    /** 양 팀 5명, 모두 같은 기본 전투력 */
    private static MatchInput evenMatch(Team winner, int strength) {
        List<SlotInput> slots = new ArrayList<>();
        for (long id = 1; id <= 5; id++) slots.add(new SlotInput(Team.BLUE, id, strength));
        for (long id = 6; id <= 10; id++) slots.add(new SlotInput(Team.RED, id, strength));
        return new MatchInput(winner, slots);
    }

    @Test
    void 기록이_없으면_빈_맵() {
        assertThat(RatingCalculator.replay(List.of())).isEmpty();
    }

    @Test
    void 대등한_경기에서_이긴_팀은_K의_절반만큼_오르고_진_팀은_같은_만큼_내린다() {
        Map<Long, Rating> r = RatingCalculator.replay(List.of(evenMatch(Team.BLUE, 5000)));
        int half = BalanceConfig.RATING_K_POINTS * 100 / 2;
        assertThat(r.get(1L).delta()).isEqualTo(half);
        assertThat(r.get(6L).delta()).isEqualTo(-half);
        assertThat(r.get(1L)).extracting(Rating::played, Rating::wins).containsExactly(1, 1);
        assertThat(r.get(6L)).extracting(Rating::played, Rating::wins).containsExactly(1, 0);
    }

    @Test
    void 이변이_클수록_변동이_크다() {
        // BLUE 가 훨씬 강한데 RED 가 이김
        List<SlotInput> slots = new ArrayList<>();
        for (long id = 1; id <= 5; id++) slots.add(new SlotInput(Team.BLUE, id, 8000));
        for (long id = 6; id <= 10; id++) slots.add(new SlotInput(Team.RED, id, 4000));
        Map<Long, Rating> upset = RatingCalculator.replay(List.of(new MatchInput(Team.RED, slots)));
        Map<Long, Rating> expected = RatingCalculator.replay(List.of(new MatchInput(Team.BLUE, slots)));

        assertThat(upset.get(6L).delta()).isGreaterThan(expected.get(1L).delta());
        assertThat(upset.get(6L).delta()).isGreaterThan(BalanceConfig.RATING_K_POINTS * 100 / 2);
        assertThat(expected.get(1L).delta()).isLessThan(BalanceConfig.RATING_K_POINTS * 100 / 2);
    }

    @Test
    void 연승해도_예상_승률이_따라_올라가_변동이_줄어들고_상한_안에_머문다() {
        List<MatchInput> streak = new ArrayList<>();
        for (int i = 0; i < 50; i++) streak.add(evenMatch(Team.BLUE, 5000));
        Map<Long, Rating> r = RatingCalculator.replay(streak);
        int max = BalanceConfig.RATING_MAX_ABS_POINTS * 100;
        assertThat(r.get(1L).delta()).isGreaterThan(0).isLessThanOrEqualTo(max);
        assertThat(r.get(6L).delta()).isLessThan(0).isGreaterThanOrEqualTo(-max);
        assertThat(r.get(1L).played()).isEqualTo(50);
        // 49경기 뒤와 50경기 뒤가 거의 같다 (수렴)
        Map<Long, Rating> r49 = RatingCalculator.replay(streak.subList(0, 49));
        assertThat(Math.abs(r.get(1L).delta() - r49.get(1L).delta())).isLessThan(20);
    }

    @Test
    void 약팀이_연속으로_이변을_일으키면_상한에서_멈춘다() {
        List<SlotInput> slots = new ArrayList<>();
        for (long id = 1; id <= 5; id++) slots.add(new SlotInput(Team.BLUE, id, 4000));
        for (long id = 6; id <= 10; id++) slots.add(new SlotInput(Team.RED, id, 8000));
        List<MatchInput> upsets = new ArrayList<>();
        for (int i = 0; i < 12; i++) upsets.add(new MatchInput(Team.BLUE, slots));
        Map<Long, Rating> r = RatingCalculator.replay(upsets);
        assertThat(r.get(1L).delta()).isEqualTo(BalanceConfig.RATING_MAX_ABS_POINTS * 100);
        assertThat(r.get(6L).delta()).isEqualTo(-BalanceConfig.RATING_MAX_ABS_POINTS * 100);
    }

    @Test
    void 승패_미정_경기와_삭제된_캐릭터는_건너뛴다() {
        List<SlotInput> slots = new ArrayList<>(evenMatch(Team.BLUE, 5000).slots());
        slots.set(0, new SlotInput(Team.BLUE, null, 5000)); // 삭제된 캐릭터
        Map<Long, Rating> r = RatingCalculator.replay(List.of(
                new MatchInput(null, slots),
                new MatchInput(Team.BLUE, slots)));
        assertThat(r).doesNotContainKey(1L);
        assertThat(r.get(2L).played()).isEqualTo(1);
    }

    @Test
    void 예상_승률은_전투력_차이로_정해진다() {
        assertThat(RatingCalculator.expectedBlueWinRate(25000, 25000)).isCloseTo(0.5, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(RatingCalculator.expectedBlueWinRate(27000, 25000)).isGreaterThan(0.6);
        assertThat(RatingCalculator.expectedBlueWinRate(23000, 25000)).isLessThan(0.4);
    }
}

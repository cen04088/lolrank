package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.Tier;
import org.junit.jupiter.api.Test;

class StrengthCalculatorTest {

    @Test
    void 계급_안_순서에_따라_점수가_10점_폭으로_나뉜다() {
        assertThat(StrengthCalculator.rankScore(HierarchyRank.S, 0, 4)).isEqualTo(80);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.S, 1, 4)).isEqualTo(77);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.S, 2, 4)).isEqualTo(73);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.S, 3, 4)).isEqualTo(70);
    }

    @Test
    void 혼자거나_맨_앞이면_계급_기준_점수_그대로() {
        assertThat(StrengthCalculator.rankScore(HierarchyRank.A, 0, 1)).isEqualTo(60);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.A, 0, 9)).isEqualTo(60);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.A, 5, 1)).isEqualTo(60);
    }

    @Test
    void 아래_계급_1위는_위_계급_꼴찌를_넘지_못한다() {
        int sLast = StrengthCalculator.rankScore(HierarchyRank.S, 9, 10);
        int aFirst = StrengthCalculator.rankScore(HierarchyRank.A, 0, 10);
        assertThat(sLast).isGreaterThan(aFirst);
        assertThat(StrengthCalculator.rankScore(HierarchyRank.LEGEND, 4, 5))
                .isGreaterThan(StrengthCalculator.rankScore(HierarchyRank.S, 0, 1));
    }

    @Test
    void 전투력은_순서_반영_등급_80퍼센트와_티어_20퍼센트의_합() {
        // S 2/2위 = 70점, Gold IV = 40점 → 80*70 + 20*40 = 6400
        assertThat(StrengthCalculator.strength(HierarchyRank.S, 1, 2, Tier.GOLD, 4)).isEqualTo(6400);
        assertThat(StrengthCalculator.strength(HierarchyRank.S, Tier.GOLD, 4)).isEqualTo(7200);
        assertThat(StrengthCalculator.toDisplay(6400)).isEqualTo(64);
    }
}

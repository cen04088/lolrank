package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BalanceGradeTest {

    @Test
    void 차이에_따라_등급이_결정된다() {
        assertThat(BalanceGrade.of(0)).isEqualTo(BalanceGrade.PERFECT);
        assertThat(BalanceGrade.of(2)).isEqualTo(BalanceGrade.PERFECT);
        assertThat(BalanceGrade.of(3)).isEqualTo(BalanceGrade.VERY_GOOD);
        assertThat(BalanceGrade.of(5)).isEqualTo(BalanceGrade.VERY_GOOD);
        assertThat(BalanceGrade.of(10)).isEqualTo(BalanceGrade.GOOD);
        assertThat(BalanceGrade.of(15)).isEqualTo(BalanceGrade.WARNING);
        assertThat(BalanceGrade.of(16)).isEqualTo(BalanceGrade.UNBALANCED);
    }

    @Test
    void 음수_차이도_절댓값으로_처리한다() {
        assertThat(BalanceGrade.of(-4)).isEqualTo(BalanceGrade.VERY_GOOD);
    }

    @Test
    void 등급마다_문구가_있다() {
        for (BalanceGrade grade : BalanceGrade.values()) {
            assertThat(grade.getMessage()).isNotBlank();
        }
    }
}

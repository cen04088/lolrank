package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lolrank.character.Tier;
import org.junit.jupiter.api.Test;

class SkillScoreCalculatorTest {

    @Test
    void 티어표_기준값이_정확하다() {
        assertThat(SkillScoreCalculator.score(Tier.IRON, 4)).isEqualTo(10);
        assertThat(SkillScoreCalculator.score(Tier.IRON, 1)).isEqualTo(16);
        assertThat(SkillScoreCalculator.score(Tier.GOLD, 4)).isEqualTo(40);
        assertThat(SkillScoreCalculator.score(Tier.GOLD, 1)).isEqualTo(46);
        assertThat(SkillScoreCalculator.score(Tier.DIAMOND, 4)).isEqualTo(70);
        assertThat(SkillScoreCalculator.score(Tier.DIAMOND, 1)).isEqualTo(79);
        assertThat(SkillScoreCalculator.score(Tier.MASTER, null)).isEqualTo(85);
        assertThat(SkillScoreCalculator.score(Tier.GRANDMASTER, null)).isEqualTo(92);
        assertThat(SkillScoreCalculator.score(Tier.CHALLENGER, null)).isEqualTo(100);
    }

    @Test
    void 상위티어는_division을_무시한다() {
        assertThat(SkillScoreCalculator.score(Tier.MASTER, 2)).isEqualTo(85);
    }

    @Test
    void division이_필요한_티어에_division이_없으면_예외() {
        assertThatThrownBy(() -> SkillScoreCalculator.score(Tier.GOLD, null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> SkillScoreCalculator.score(Tier.GOLD, 5))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 평균점수를_가장_가까운_티어로_표기한다() {
        assertThat(SkillScoreCalculator.nearestTierLabel(40)).isEqualTo("Gold IV");
        assertThat(SkillScoreCalculator.nearestTierLabel(45.5)).isEqualTo("Gold I");
        assertThat(SkillScoreCalculator.nearestTierLabel(84)).isEqualTo("Master");
        assertThat(SkillScoreCalculator.nearestTierLabel(200)).isEqualTo("Challenger");
        assertThat(SkillScoreCalculator.nearestTierLabel(0)).isEqualTo("Iron IV");
    }
}

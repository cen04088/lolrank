package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;

import com.lolrank.character.Position;
import java.util.List;
import org.junit.jupiter.api.Test;

class PositionFitTest {

    @Test
    void 주_부_비선호_포지션을_구분한다() {
        assertThat(PositionFit.of(Position.TOP, List.of(Position.MID), Position.TOP)).isEqualTo(PositionFit.MAIN);
        assertThat(PositionFit.of(Position.TOP, List.of(Position.MID), Position.MID)).isEqualTo(PositionFit.SUB);
        assertThat(PositionFit.of(Position.TOP, List.of(Position.MID), Position.ADC)).isEqualTo(PositionFit.OFF);
    }

    @Test
    void 부포지션이_없으면_주포지션_외에는_모두_비선호() {
        assertThat(PositionFit.of(Position.JUNGLE, List.of(), Position.JUNGLE)).isEqualTo(PositionFit.MAIN);
        assertThat(PositionFit.of(Position.JUNGLE, List.of(), Position.SUPPORT)).isEqualTo(PositionFit.OFF);
    }

    @Test
    void 부포지션이_여러개면_그중_하나만_맞아도_SUB() {
        List<Position> subs = List.of(Position.MID, Position.ADC, Position.SUPPORT);
        assertThat(PositionFit.of(Position.TOP, subs, Position.ADC)).isEqualTo(PositionFit.SUB);
        assertThat(PositionFit.of(Position.TOP, subs, Position.SUPPORT)).isEqualTo(PositionFit.SUB);
        assertThat(PositionFit.of(Position.TOP, subs, Position.JUNGLE)).isEqualTo(PositionFit.OFF);
    }

    @Test
    void 페널티는_Config_값을_따른다() {
        assertThat(PositionFit.penalty(Position.TOP, List.of(Position.MID), Position.TOP))
                .isEqualTo(BalanceConfig.MAIN_POSITION_PENALTY).isEqualTo(0);
        assertThat(PositionFit.penalty(Position.TOP, List.of(Position.MID), Position.MID))
                .isEqualTo(BalanceConfig.SUB_POSITION_PENALTY).isEqualTo(8);
        assertThat(PositionFit.penalty(Position.TOP, List.of(Position.MID), Position.ADC))
                .isEqualTo(BalanceConfig.OFF_POSITION_PENALTY).isEqualTo(25);
    }
}

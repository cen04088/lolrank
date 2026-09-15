package com.lolrank.team.balance;

import static org.assertj.core.api.Assertions.assertThat;

import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.team.Team;
import com.lolrank.team.balance.AutoFillSolver.Assignment;
import com.lolrank.team.balance.AutoFillSolver.Candidate;
import com.lolrank.team.balance.AutoFillSolver.SlotKey;
import com.lolrank.team.balance.AutoFillSolver.Solution;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.Test;

class AutoFillSolverTest {

    private static final long SEED = 42L;

    private final AutoFillSolver solver = new AutoFillSolver(new Random(SEED));

    // ------------------------------------------------------------ fixtures

    private static List<SlotKey> allSlots() {
        List<SlotKey> slots = new ArrayList<>();
        for (Team team : Team.values()) {
            for (Position position : Position.values()) {
                slots.add(new SlotKey(team, position));
            }
        }
        return slots;
    }

    private static List<SlotKey> slotsExcept(Set<SlotKey> manual) {
        return allSlots().stream().filter(s -> !manual.contains(s)).toList();
    }

    private static Candidate candidate(long id, Tier tier, Integer division, Position main, Position sub) {
        return new Candidate(id, SkillScoreCalculator.score(tier, division), main, sub);
    }

    /** 포지션마다 같은 티어 2명씩 → 모두 주 포지션 + 차이 0 이 가능한 이상적인 10명. */
    private static List<Candidate> balancedTen() {
        return List.of(
                candidate(1, Tier.GOLD, 4, Position.TOP, Position.MID),
                candidate(2, Tier.GOLD, 4, Position.TOP, Position.JUNGLE),
                candidate(3, Tier.SILVER, 1, Position.JUNGLE, Position.TOP),
                candidate(4, Tier.SILVER, 1, Position.JUNGLE, null),
                candidate(5, Tier.PLATINUM, 2, Position.MID, Position.ADC),
                candidate(6, Tier.PLATINUM, 2, Position.MID, Position.SUPPORT),
                candidate(7, Tier.BRONZE, 3, Position.ADC, Position.MID),
                candidate(8, Tier.BRONZE, 3, Position.ADC, null),
                candidate(9, Tier.EMERALD, 4, Position.SUPPORT, Position.ADC),
                candidate(10, Tier.EMERALD, 4, Position.SUPPORT, Position.JUNGLE)
        );
    }

    // ------------------------------------------------------------ helpers

    private static void assertValidAssignment(Solution solution, List<SlotKey> emptySlots, List<Candidate> candidates) {
        int expected = Math.min(emptySlots.size(), candidates.size());
        assertThat(solution.assignments()).hasSize(expected);

        Set<SlotKey> usedSlots = new HashSet<>();
        Set<Long> usedCharacters = new HashSet<>();
        for (Assignment a : solution.assignments()) {
            assertThat(emptySlots).contains(a.slot());
            assertThat(usedSlots.add(a.slot())).as("슬롯 중복: " + a.slot()).isTrue();
            assertThat(usedCharacters.add(a.characterId())).as("캐릭터 중복: " + a.characterId()).isTrue();
        }
    }

    /** 검증용 독립 완전 탐색: 최소 totalCost 만 계산한다. */
    private static int bruteForceMinCost(List<SlotKey> slots, List<Candidate> candidates, int fixedBlue, int fixedRed) {
        int[] best = {Integer.MAX_VALUE};
        boolean[] used = new boolean[candidates.size()];
        int skips = slots.size() - Math.min(slots.size(), candidates.size());
        bruteForce(slots, candidates, 0, used, fixedBlue, fixedRed, 0, skips, best);
        return best[0];
    }

    private static void bruteForce(List<SlotKey> slots, List<Candidate> candidates, int index, boolean[] used,
                                   int blue, int red, int penalty, int skipsLeft, int[] best) {
        if (index == slots.size()) {
            int cost = Math.abs(blue - red) * BalanceConfig.RANK_BALANCE_WEIGHT + penalty;
            best[0] = Math.min(best[0], cost);
            return;
        }
        SlotKey slot = slots.get(index);
        for (int c = 0; c < candidates.size(); c++) {
            if (used[c]) {
                continue;
            }
            used[c] = true;
            Candidate cand = candidates.get(c);
            int p = PositionFit.penalty(cand.mainPosition(), cand.subPosition(), slot.position());
            bruteForce(slots, candidates, index + 1, used,
                    slot.team() == Team.BLUE ? blue + cand.skillScore() : blue,
                    slot.team() == Team.RED ? red + cand.skillScore() : red,
                    penalty + p, skipsLeft, best);
            used[c] = false;
        }
        if (skipsLeft > 0) {
            bruteForce(slots, candidates, index + 1, used, blue, red, penalty, skipsLeft - 1, best);
        }
    }

    // ------------------------------------------------------------ tests

    @Test
    void 수동배치_없는_10명은_모두_주포지션에_완벽_밸런스로_배치된다() {
        List<SlotKey> slots = allSlots();
        List<Candidate> candidates = balancedTen();

        Solution solution = solver.solve(slots, candidates, 0, 0);

        assertValidAssignment(solution, slots, candidates);
        assertThat(solution.totalPositionPenalty()).isZero();
        assertThat(solution.difference()).isZero();
        assertThat(solution.totalCost()).isZero();
        assertThat(solution.assignments()).allMatch(a -> a.fit() == PositionFit.MAIN);
    }

    @Test
    void 두명_수동배치_후_나머지_8명을_최적으로_채운다() {
        // BLUE TOP = MASTER(85), RED ADC = SILVER IV(30) 를 수동 배치했다고 가정
        Set<SlotKey> manual = Set.of(new SlotKey(Team.BLUE, Position.TOP), new SlotKey(Team.RED, Position.ADC));
        List<SlotKey> slots = slotsExcept(manual);
        List<Candidate> candidates = List.of(
                candidate(11, Tier.GOLD, 2, Position.TOP, Position.JUNGLE),
                candidate(12, Tier.PLATINUM, 4, Position.JUNGLE, Position.TOP),
                candidate(13, Tier.SILVER, 2, Position.JUNGLE, Position.MID),
                candidate(14, Tier.DIAMOND, 4, Position.MID, Position.ADC),
                candidate(15, Tier.BRONZE, 1, Position.MID, Position.SUPPORT),
                candidate(16, Tier.GOLD, 1, Position.ADC, Position.MID),
                candidate(17, Tier.EMERALD, 3, Position.SUPPORT, Position.ADC),
                candidate(18, Tier.IRON, 2, Position.SUPPORT, Position.TOP)
        );
        int fixedBlue = SkillScoreCalculator.score(Tier.MASTER, null);
        int fixedRed = SkillScoreCalculator.score(Tier.SILVER, 4);

        Solution solution = solver.solve(slots, candidates, fixedBlue, fixedRed);

        assertValidAssignment(solution, slots, candidates);
        assertThat(solution.totalCost()).isEqualTo(bruteForceMinCost(slots, candidates, fixedBlue, fixedRed));
        assertThat(solution.blueScore()).isGreaterThanOrEqualTo(fixedBlue);
        assertThat(solution.redScore()).isGreaterThanOrEqualTo(fixedRed);
    }

    @Test
    void 여섯명_수동배치_후_남은_4명을_채운다() {
        Set<SlotKey> manual = Set.of(
                new SlotKey(Team.BLUE, Position.TOP), new SlotKey(Team.BLUE, Position.MID),
                new SlotKey(Team.BLUE, Position.ADC), new SlotKey(Team.RED, Position.TOP),
                new SlotKey(Team.RED, Position.JUNGLE), new SlotKey(Team.RED, Position.SUPPORT));
        List<SlotKey> slots = slotsExcept(manual);
        assertThat(slots).hasSize(4);
        List<Candidate> candidates = List.of(
                candidate(21, Tier.GOLD, 3, Position.JUNGLE, Position.SUPPORT),
                candidate(22, Tier.GOLD, 3, Position.SUPPORT, null),
                candidate(23, Tier.PLATINUM, 1, Position.MID, Position.ADC),
                candidate(24, Tier.SILVER, 4, Position.ADC, Position.MID)
        );
        int fixedBlue = 120;
        int fixedRed = 150;

        Solution solution = solver.solve(slots, candidates, fixedBlue, fixedRed);

        assertValidAssignment(solution, slots, candidates);
        assertThat(solution.totalCost()).isEqualTo(bruteForceMinCost(slots, candidates, fixedBlue, fixedRed));
    }

    @Test
    void 포지션이_심하게_중복되면_주포지션은_2명만_가능하고_나머지는_비선호로_배치된다() {
        List<SlotKey> slots = allSlots();
        List<Candidate> candidates = new ArrayList<>();
        for (long id = 1; id <= 10; id++) {
            candidates.add(candidate(id, Tier.GOLD, 4, Position.MID, null));
        }

        Solution solution = solver.solve(slots, candidates, 0, 0);

        assertValidAssignment(solution, slots, candidates);
        long mainCount = solution.assignments().stream().filter(a -> a.fit() == PositionFit.MAIN).count();
        long offCount = solution.assignments().stream().filter(a -> a.fit() == PositionFit.OFF).count();
        assertThat(mainCount).isEqualTo(2);
        assertThat(offCount).isEqualTo(8);
        assertThat(solution.totalPositionPenalty()).isEqualTo(8 * BalanceConfig.OFF_POSITION_PENALTY);
        assertThat(solution.difference()).isZero();
    }

    @Test
    void 티어차이가_크면_강한_두명을_양팀에_나눈다() {
        List<SlotKey> slots = allSlots();
        List<Candidate> candidates = new ArrayList<>();
        candidates.add(candidate(1, Tier.MASTER, null, Position.MID, Position.TOP));
        candidates.add(candidate(2, Tier.MASTER, null, Position.MID, Position.JUNGLE));
        Position[] positions = Position.values();
        for (long id = 3; id <= 10; id++) {
            Position main = positions[(int) (id % positions.length)];
            candidates.add(candidate(id, Tier.SILVER, 4, main, null));
        }

        Solution solution = solver.solve(slots, candidates, 0, 0);

        assertValidAssignment(solution, slots, candidates);
        Team teamOfFirstMaster = teamOf(solution, 1);
        Team teamOfSecondMaster = teamOf(solution, 2);
        assertThat(teamOfFirstMaster).isNotEqualTo(teamOfSecondMaster);
        assertThat(solution.difference()).isZero();
    }

    @Test
    void 참가자가_슬롯보다_적으면_가능한_만큼만_채운다() {
        List<SlotKey> slots = allSlots();
        List<Candidate> candidates = balancedTen().subList(0, 7);

        Solution solution = solver.solve(slots, candidates, 0, 0);

        assertValidAssignment(solution, slots, candidates);
        assertThat(solution.assignments()).hasSize(7);
    }

    @Test
    void 빈_입력이면_아무것도_배치하지_않는다() {
        Solution noSlots = solver.solve(List.of(), balancedTen(), 10, 20);
        assertThat(noSlots.assignments()).isEmpty();
        assertThat(noSlots.blueScore()).isEqualTo(10);
        assertThat(noSlots.redScore()).isEqualTo(20);

        Solution noCandidates = solver.solve(allSlots(), List.of(), 0, 0);
        assertThat(noCandidates.assignments()).isEmpty();
    }

    @Test
    void 같은_시드면_같은_결과를_낸다() {
        List<SlotKey> slots = allSlots();
        List<Candidate> candidates = balancedTen();

        Solution first = new AutoFillSolver(new Random(7)).solve(slots, candidates, 0, 0);
        Solution second = new AutoFillSolver(new Random(7)).solve(slots, candidates, 0, 0);

        assertThat(first.assignments()).isEqualTo(second.assignments());
    }

    private static Team teamOf(Solution solution, long characterId) {
        return solution.assignments().stream()
                .filter(a -> a.characterId() == characterId)
                .map(a -> a.slot().team())
                .findFirst()
                .orElseThrow();
    }
}

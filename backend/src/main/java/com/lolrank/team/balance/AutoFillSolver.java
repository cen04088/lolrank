package com.lolrank.team.balance;

import com.lolrank.character.Position;
import com.lolrank.team.Team;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * 남은 슬롯에 남은 캐릭터를 배치하는 최적 조합을 완전 탐색(백트래킹)으로 찾는다.
 *
 * <pre>
 * totalCost = |blueScore - redScore| * rankBalanceWeight + Σ positionPenalty
 * </pre>
 *
 * 동점 우선순위: 비선호(OFF) 포지션 수 적음 → 주(MAIN) 포지션 수 많음 → 실력 차이 작음 → 랜덤.
 * 최대 10명 규모이므로 성능보다 명확성을 우선한다. MANUAL 슬롯은 호출 측에서 이미 제외되어 있어야 한다.
 * 가중치는 {@link AutoFillMode} 가 결정하고, RANDOM 모드는 탐색 없이 무작위로 채운다.
 */
public final class AutoFillSolver {

    public record SlotKey(Team team, Position position) {
    }

    public record Candidate(long characterId, int skillScore, Position mainPosition, Position subPosition) {
    }

    public record Assignment(SlotKey slot, long characterId, PositionFit fit) {
    }

    public record Solution(List<Assignment> assignments, int blueScore, int redScore,
                           int totalPositionPenalty, int totalCost) {

        public int difference() {
            return Math.abs(blueScore - redScore);
        }
    }

    private final Random random;

    public AutoFillSolver() {
        this(new Random());
    }

    public AutoFillSolver(Random random) {
        this.random = random;
    }

    /** 기본 모드(실력 균형)로 풀이한다. */
    public Solution solve(List<SlotKey> emptySlots, List<Candidate> candidates,
                          int fixedBlueScore, int fixedRedScore) {
        return solve(emptySlots, candidates, fixedBlueScore, fixedRedScore, AutoFillMode.SKILL_BALANCE);
    }

    /**
     * @param emptySlots      비어 있는 슬롯 (AUTO 슬롯은 미리 비워서 포함)
     * @param candidates      아직 배치되지 않은 참가자
     * @param fixedBlueScore  MANUAL 로 고정된 BLUE 팀 점수 합
     * @param fixedRedScore   MANUAL 로 고정된 RED 팀 점수 합
     * @param mode            배정 방식
     */
    public Solution solve(List<SlotKey> emptySlots, List<Candidate> candidates,
                          int fixedBlueScore, int fixedRedScore, AutoFillMode mode) {
        if (emptySlots.isEmpty() || candidates.isEmpty()) {
            return new Solution(List.of(), fixedBlueScore, fixedRedScore, 0,
                    Math.abs(fixedBlueScore - fixedRedScore) * mode.getRankBalanceWeight());
        }
        if (mode.isRandom()) {
            return shuffle(emptySlots, candidates, fixedBlueScore, fixedRedScore);
        }
        return new Search(emptySlots, candidates, fixedBlueScore, fixedRedScore, mode).run();
    }

    private Solution shuffle(List<SlotKey> emptySlots, List<Candidate> candidates,
                             int fixedBlueScore, int fixedRedScore) {
        List<SlotKey> slots = new ArrayList<>(emptySlots);
        List<Candidate> pool = new ArrayList<>(candidates);
        Collections.shuffle(slots, random);
        Collections.shuffle(pool, random);

        List<Assignment> assignments = new ArrayList<>();
        int blue = fixedBlueScore;
        int red = fixedRedScore;
        int penalty = 0;
        int count = Math.min(slots.size(), pool.size());
        for (int i = 0; i < count; i++) {
            SlotKey slot = slots.get(i);
            Candidate candidate = pool.get(i);
            PositionFit fit = PositionFit.of(candidate.mainPosition(), candidate.subPosition(), slot.position());
            assignments.add(new Assignment(slot, candidate.characterId(), fit));
            if (slot.team() == Team.BLUE) {
                blue += candidate.skillScore();
            } else {
                red += candidate.skillScore();
            }
            penalty += fit.getPenalty();
        }
        return new Solution(List.copyOf(assignments), blue, red, penalty, 0);
    }

    private final class Search {

        private final List<SlotKey> slots;
        private final List<Candidate> candidates;
        private final int fixedBlueScore;
        private final int fixedRedScore;
        private final int rankBalanceWeight;
        private final int skipsAllowed;
        private final int[][] penalty;
        private final PositionFit[][] fits;
        private final int[] chosen;
        private final boolean[] used;

        private int[] bestChosen;
        private int bestCost;
        private int bestOffCount;
        private int bestMainCount;
        private int bestDifference;
        private int bestBlueScore;
        private int bestRedScore;
        private int bestPenalty;
        private int equalCount;

        Search(List<SlotKey> slots, List<Candidate> candidates, int fixedBlueScore, int fixedRedScore,
               AutoFillMode mode) {
            this.slots = slots;
            this.candidates = candidates;
            this.fixedBlueScore = fixedBlueScore;
            this.fixedRedScore = fixedRedScore;
            this.rankBalanceWeight = mode.getRankBalanceWeight();
            int fillCount = Math.min(slots.size(), candidates.size());
            this.skipsAllowed = slots.size() - fillCount;
            this.penalty = new int[slots.size()][candidates.size()];
            this.fits = new PositionFit[slots.size()][candidates.size()];
            for (int s = 0; s < slots.size(); s++) {
                for (int c = 0; c < candidates.size(); c++) {
                    Candidate candidate = candidates.get(c);
                    PositionFit fit = PositionFit.of(candidate.mainPosition(), candidate.subPosition(),
                            slots.get(s).position());
                    fits[s][c] = fit;
                    penalty[s][c] = mode.penaltyOf(fit);
                }
            }
            this.chosen = new int[slots.size()];
            this.used = new boolean[candidates.size()];
        }

        Solution run() {
            dfs(0, fixedBlueScore, fixedRedScore, 0, 0, 0, skipsAllowed);
            List<Assignment> assignments = new ArrayList<>();
            for (int s = 0; s < slots.size(); s++) {
                int c = bestChosen[s];
                if (c >= 0) {
                    assignments.add(new Assignment(slots.get(s), candidates.get(c).characterId(), fits[s][c]));
                }
            }
            return new Solution(List.copyOf(assignments), bestBlueScore, bestRedScore, bestPenalty, bestCost);
        }

        private void dfs(int slotIndex, int blueScore, int redScore, int penaltySum,
                         int offCount, int mainCount, int skipsLeft) {
            // 포지션 페널티는 누적만 되므로 이미 최선보다 크면 더 볼 필요가 없다.
            if (bestChosen != null && penaltySum > bestCost) {
                return;
            }
            if (slotIndex == slots.size()) {
                evaluate(blueScore, redScore, penaltySum, offCount, mainCount);
                return;
            }
            SlotKey slot = slots.get(slotIndex);
            for (int c = 0; c < candidates.size(); c++) {
                if (used[c]) {
                    continue;
                }
                used[c] = true;
                chosen[slotIndex] = c;
                int score = candidates.get(c).skillScore();
                PositionFit fit = fits[slotIndex][c];
                dfs(slotIndex + 1,
                        slot.team() == Team.BLUE ? blueScore + score : blueScore,
                        slot.team() == Team.RED ? redScore + score : redScore,
                        penaltySum + penalty[slotIndex][c],
                        offCount + (fit == PositionFit.OFF ? 1 : 0),
                        mainCount + (fit == PositionFit.MAIN ? 1 : 0),
                        skipsLeft);
                used[c] = false;
            }
            if (skipsLeft > 0) {
                chosen[slotIndex] = -1;
                dfs(slotIndex + 1, blueScore, redScore, penaltySum, offCount, mainCount, skipsLeft - 1);
            }
        }

        private void evaluate(int blueScore, int redScore, int penaltySum, int offCount, int mainCount) {
            int difference = Math.abs(blueScore - redScore);
            int cost = difference * rankBalanceWeight + penaltySum;
            int comparison = compareWithBest(cost, offCount, mainCount, difference);
            if (comparison < 0) {
                equalCount = 1;
                remember(cost, offCount, mainCount, difference, blueScore, redScore, penaltySum);
            } else if (comparison == 0) {
                // 완전 동점: reservoir sampling 으로 균등하게 하나를 고른다.
                equalCount++;
                if (random.nextInt(equalCount) == 0) {
                    remember(cost, offCount, mainCount, difference, blueScore, redScore, penaltySum);
                }
            }
        }

        private int compareWithBest(int cost, int offCount, int mainCount, int difference) {
            if (bestChosen == null) {
                return -1;
            }
            if (cost != bestCost) {
                return Integer.compare(cost, bestCost);
            }
            if (offCount != bestOffCount) {
                return Integer.compare(offCount, bestOffCount);
            }
            if (mainCount != bestMainCount) {
                return Integer.compare(bestMainCount, mainCount);
            }
            return Integer.compare(difference, bestDifference);
        }

        private void remember(int cost, int offCount, int mainCount, int difference,
                              int blueScore, int redScore, int penaltySum) {
            bestChosen = chosen.clone();
            bestCost = cost;
            bestOffCount = offCount;
            bestMainCount = mainCount;
            bestDifference = difference;
            bestBlueScore = blueScore;
            bestRedScore = redScore;
            bestPenalty = penaltySum;
        }
    }
}

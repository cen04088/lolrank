import type { AutoFillMode, BalanceGrade, Character, HierarchyRank, Position, Tier } from '@/api/types'

export const TIER_NAMES: Record<Tier, string> = {
  IRON: 'Iron',
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  EMERALD: 'Emerald',
  DIAMOND: 'Diamond',
  MASTER: 'Master',
  GRANDMASTER: 'Grandmaster',
  CHALLENGER: 'Challenger',
}

/** 티어별 대표 색 (배지/테두리) */
export const TIER_COLORS: Record<Tier, string> = {
  IRON: '#8a8a8a',
  BRONZE: '#b0733a',
  SILVER: '#b9c4d0',
  GOLD: '#f5c451',
  PLATINUM: '#4fd1c5',
  EMERALD: '#3ecf6f',
  DIAMOND: '#6fa8ff',
  MASTER: '#b38cff',
  GRANDMASTER: '#ff6b6b',
  CHALLENGER: '#ffd86b',
}

const ROMAN = ['I', 'II', 'III', 'IV']

export function tierHasDivision(tier: Tier): boolean {
  return tier !== 'MASTER' && tier !== 'GRANDMASTER' && tier !== 'CHALLENGER'
}

export function tierLabel(tier: Tier, division: number | null | undefined): string {
  if (tierHasDivision(tier) && division && division >= 1 && division <= 4) {
    return `${TIER_NAMES[tier]} ${ROMAN[division - 1]}`
  }
  return TIER_NAMES[tier]
}

export const POSITION_LABELS: Record<Position, string> = {
  TOP: 'TOP',
  JUNGLE: 'JUNGLE',
  MID: 'MID',
  ADC: 'ADC',
  SUPPORT: 'SUPPORT',
}

export const POSITION_SHORT: Record<Position, string> = {
  TOP: 'TOP',
  JUNGLE: 'JGL',
  MID: 'MID',
  ADC: 'ADC',
  SUPPORT: 'SUP',
}

export const POSITION_ICONS: Record<Position, string> = {
  TOP: '🛡',
  JUNGLE: '🌲',
  MID: '⚡',
  ADC: '🏹',
  SUPPORT: '✨',
}

export const RANK_LABELS: Record<HierarchyRank, string> = {
  LEGEND: 'LEGEND',
  S: 'S RANK',
  A: 'A RANK',
  B: 'B RANK',
  C: 'C RANK',
}

export const GRADE_STARS: Record<BalanceGrade, number> = {
  PERFECT: 5,
  VERY_GOOD: 4,
  GOOD: 3,
  WARNING: 2,
  UNBALANCED: 1,
}

export type PositionFit = 'MAIN' | 'SUB' | 'OFF'

export function positionFit(
  character: Pick<Character, 'mainPosition' | 'subPosition'>,
  position: Position,
): PositionFit {
  if (character.mainPosition === position) return 'MAIN'
  if (character.subPosition === position) return 'SUB'
  return 'OFF'
}

export const FIT_LABELS: Record<PositionFit, string> = {
  MAIN: '✓ MAIN POSITION',
  SUB: '△ SUB POSITION',
  OFF: '! OFF POSITION',
}

export function positionSummary(character: Pick<Character, 'mainPosition' | 'subPosition'>): string {
  return character.subPosition
    ? `${POSITION_LABELS[character.mainPosition]} · ${POSITION_LABELS[character.subPosition]}`
    : POSITION_LABELS[character.mainPosition]
}

export const AUTO_FILL_MODE_LABELS: Record<AutoFillMode, { icon: string; label: string; hint: string }> = {
  SKILL_BALANCE: { icon: '👑', label: '실력 균형', hint: '티어 합이 비슷해지도록 채웁니다. 포지션은 보조 기준.' },
  POSITION_BALANCE: { icon: '👥', label: '포지션 균형', hint: '주/부 포지션을 최대한 지켜서 채웁니다.' },
  RANDOM: { icon: '🔀', label: '완전 랜덤', hint: '실력·포지션을 보지 않고 무작위로 채웁니다.' },
}

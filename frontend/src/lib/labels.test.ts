import { describe, expect, it } from 'vitest'
import { RANK_LABELS, rankScore } from './labels'

describe('rankScore', () => {
  it('계급 안 순서에 따라 10점 폭으로 나뉜다 (백엔드 StrengthCalculator 와 동일)', () => {
    expect(rankScore('S', 0, 4)).toBe(80)
    expect(rankScore('S', 1, 4)).toBe(77)
    expect(rankScore('S', 2, 4)).toBe(73)
    expect(rankScore('S', 3, 4)).toBe(70)
  })

  it('혼자거나 맨 앞이면 기준 점수', () => {
    expect(rankScore('A', 0, 1)).toBe(60)
    expect(rankScore('A', 0, 7)).toBe(60)
  })

  it('아래 계급 1위는 위 계급 꼴찌보다 낮다', () => {
    expect(rankScore('S', 9, 10)).toBeGreaterThan(rankScore('A', 0, 10))
  })

  it('최고 계급 표기는 국가권력급', () => {
    expect(RANK_LABELS.LEGEND).toBe('국가권력급')
  })
})

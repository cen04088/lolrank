import { describe, expect, it } from 'vitest'
import type { Character, HierarchyRank } from '@/api/types'
import { findRankOf, groupByRank, moveCharacter, parseCardSortId, parseRankDropId, toEntries } from './hierarchy'

function character(id: number, rank: HierarchyRank, order: number): Character {
  return {
    id,
    roomId: 1,
    name: `c${id}`,
    description: null,
    assetKey: 'player_01',
    tier: 'GOLD',
    division: 4,
    tierLabel: 'Gold IV',
    mainPosition: 'TOP',
    subPositions: [],
    hierarchyRank: rank,
    hierarchyOrder: order,
    createdAt: '',
    updatedAt: '',
  }
}

const characters = [
  character(1, 'S', 1),
  character(2, 'S', 0),
  character(3, 'A', 0),
  character(4, 'C', 5),
  character(5, 'C', 5),
]

describe('groupByRank', () => {
  it('계급별로 묶고 order → id 순으로 정렬한다', () => {
    const buckets = groupByRank(characters)
    expect(buckets.S.map((c) => c.id)).toEqual([2, 1])
    expect(buckets.A.map((c) => c.id)).toEqual([3])
    expect(buckets.C.map((c) => c.id)).toEqual([4, 5])
    expect(buckets.LEGEND).toEqual([])
    expect(buckets.B).toEqual([])
  })
})

describe('moveCharacter', () => {
  const buckets = groupByRank(characters)

  it('다른 계급으로 옮기면 원래 계급에서 빠지고 지정 위치에 들어간다', () => {
    const next = moveCharacter(buckets, 4, 'S', 1)
    expect(next.C.map((c) => c.id)).toEqual([5])
    expect(next.S.map((c) => c.id)).toEqual([2, 4, 1])
    expect(findRankOf(next, 4)).toBe('S')
    expect(buckets.C).toHaveLength(2) // 원본 불변
  })

  it('빈 계급으로 옮길 수 있다', () => {
    const next = moveCharacter(buckets, 3, 'LEGEND', 0)
    expect(next.LEGEND.map((c) => c.id)).toEqual([3])
    expect(next.A).toEqual([])
  })

  it('같은 계급 안에서 순서를 바꾼다', () => {
    const next = moveCharacter(buckets, 1, 'S', 0)
    expect(next.S.map((c) => c.id)).toEqual([1, 2])
  })

  it('범위를 벗어난 index 는 끝에 붙인다', () => {
    const next = moveCharacter(buckets, 3, 'C', 99)
    expect(next.C.map((c) => c.id)).toEqual([4, 5, 3])
  })

  it('같은 자리로 옮기면 같은 객체를 돌려준다', () => {
    expect(moveCharacter(buckets, 2, 'S', 0)).toBe(buckets)
  })

  it('없는 캐릭터는 무시한다', () => {
    expect(moveCharacter(buckets, 999, 'S', 0)).toBe(buckets)
  })
})

describe('toEntries', () => {
  it('계급 순서대로 order 를 0부터 다시 매긴다', () => {
    const entries = toEntries(groupByRank(characters))
    expect(entries).toEqual([
      { characterId: 2, rank: 'S', order: 0 },
      { characterId: 1, rank: 'S', order: 1 },
      { characterId: 3, rank: 'A', order: 0 },
      { characterId: 4, rank: 'C', order: 0 },
      { characterId: 5, rank: 'C', order: 1 },
    ])
  })
})

describe('id parsing', () => {
  it('카드/계급 id 를 해석한다', () => {
    expect(parseCardSortId('card:12')).toBe(12)
    expect(parseCardSortId('rank:S')).toBeNull()
    expect(parseRankDropId('rank:LEGEND')).toBe('LEGEND')
    expect(parseRankDropId('rank:X')).toBeNull()
  })
})

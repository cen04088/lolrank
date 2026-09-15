import { HIERARCHY_RANKS, type Character, type HierarchyEntry, type HierarchyRank } from '@/api/types'

export type RankBuckets = Record<HierarchyRank, Character[]>

export function rankDropId(rank: HierarchyRank): string {
  return `rank:${rank}`
}

export function cardSortId(characterId: number): string {
  return `card:${characterId}`
}

export function parseCardSortId(id: string): number | null {
  if (!id.startsWith('card:')) return null
  const value = Number(id.slice('card:'.length))
  return Number.isFinite(value) ? value : null
}

export function parseRankDropId(id: string): HierarchyRank | null {
  if (!id.startsWith('rank:')) return null
  const rank = id.slice('rank:'.length)
  return (HIERARCHY_RANKS as readonly string[]).includes(rank) ? (rank as HierarchyRank) : null
}

export function emptyBuckets(): RankBuckets {
  return { LEGEND: [], S: [], A: [], B: [], C: [] }
}

/** 계급별로 묶고 hierarchyOrder → id 순으로 정렬한다. */
export function groupByRank(characters: Character[]): RankBuckets {
  const buckets = emptyBuckets()
  for (const character of characters) {
    buckets[character.hierarchyRank].push(character)
  }
  for (const rank of HIERARCHY_RANKS) {
    buckets[rank].sort((a, b) => a.hierarchyOrder - b.hierarchyOrder || a.id - b.id)
  }
  return buckets
}

export function findRankOf(buckets: RankBuckets, characterId: number): HierarchyRank | undefined {
  return HIERARCHY_RANKS.find((rank) => buckets[rank].some((character) => character.id === characterId))
}

/**
 * characterId 를 toRank 의 toIndex 위치로 옮긴 새 buckets 를 돌려준다.
 * toIndex 가 범위를 벗어나면 끝에 붙인다. 변화가 없으면 같은 객체를 돌려준다.
 */
export function moveCharacter(
  buckets: RankBuckets,
  characterId: number,
  toRank: HierarchyRank,
  toIndex: number,
): RankBuckets {
  const fromRank = findRankOf(buckets, characterId)
  if (!fromRank) return buckets

  const fromIndex = buckets[fromRank].findIndex((character) => character.id === characterId)
  const character = buckets[fromRank][fromIndex]

  const next: RankBuckets = { ...buckets, [fromRank]: buckets[fromRank].filter((c) => c.id !== characterId) }
  const target = fromRank === toRank ? next[fromRank] : [...buckets[toRank]]
  const clampedIndex = Math.max(0, Math.min(toIndex, target.length))

  if (fromRank === toRank && clampedIndex === fromIndex) return buckets

  const inserted = [...target.slice(0, clampedIndex), character, ...target.slice(clampedIndex)]
  next[toRank] = inserted
  return next
}

export function toEntries(buckets: RankBuckets): HierarchyEntry[] {
  return HIERARCHY_RANKS.flatMap((rank) =>
    buckets[rank].map((character, order) => ({ characterId: character.id, rank, order })),
  )
}

export function totalCount(buckets: RankBuckets): number {
  return HIERARCHY_RANKS.reduce((sum, rank) => sum + buckets[rank].length, 0)
}

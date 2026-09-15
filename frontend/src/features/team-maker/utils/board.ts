import { POSITIONS, TEAMS, type Character, type Position, type Slot, type SlotRequest, type Team } from '@/api/types'

export const BENCH_DROP_ID = 'bench'

export function slotDropId(team: Team, position: Position): string {
  return `slot:${team}:${position}`
}

export function characterDragId(characterId: number): string {
  return `char:${characterId}`
}

export type SlotLocation = { team: Team; position: Position }

export type DropTarget = { kind: 'bench' } | ({ kind: 'slot' } & SlotLocation)

export type DragData = {
  characterId: number
  from: { kind: 'bench' } | ({ kind: 'slot' } & SlotLocation)
}

export type DropData = DropTarget

export function isSlotAt(slot: Slot, location: SlotLocation): boolean {
  return slot.team === location.team && slot.position === location.position
}

export function findSlotOf(slots: Slot[], characterId: number): Slot | undefined {
  return slots.find((slot) => slot.characterId === characterId)
}

export function slotAt(slots: Slot[], location: SlotLocation): Slot | undefined {
  return slots.find((slot) => isSlotAt(slot, location))
}

/** 서버 응답에 슬롯이 빠져 있어도 항상 10개(BLUE 5 + RED 5)를 정렬된 순서로 보장한다. */
export function normalizeSlots(slots: Slot[]): Slot[] {
  return TEAMS.flatMap((team) =>
    POSITIONS.map(
      (position) => slotAt(slots, { team, position }) ?? { team, position, characterId: null, source: null },
    ),
  )
}

export function slotsForTeam(slots: Slot[], team: Team): Slot[] {
  return POSITIONS.map(
    (position) => slotAt(slots, { team, position }) ?? { team, position, characterId: null, source: null },
  )
}

/**
 * 드롭 결과를 계산한다. 원본 배열은 바꾸지 않는다.
 * - 슬롯 → 빈 슬롯 / 벤치 → 빈 슬롯: 이동
 * - 사람이 있는 슬롯에 드롭: SWAP (벤치에서 왔으면 기존 캐릭터는 벤치로)
 * - 벤치에 드롭: 보드에서 제거
 * 사람이 옮긴 캐릭터는 항상 MANUAL 이 된다.
 */
export function applyDrop(slots: Slot[], characterId: number, target: DropTarget): Slot[] {
  const origin = findSlotOf(slots, characterId)

  if (target.kind === 'bench') {
    if (!origin) return slots
    return slots.map((slot) => (isSlotAt(slot, origin) ? emptied(slot) : slot))
  }

  const destination = slotAt(slots, target)
  if (!destination) return slots
  if (origin && isSlotAt(origin, target)) return slots

  const displacedId = destination.characterId

  return slots.map((slot) => {
    if (isSlotAt(slot, target)) {
      return { ...slot, characterId, source: 'MANUAL' as const }
    }
    if (origin && isSlotAt(slot, origin)) {
      return displacedId !== null ? { ...slot, characterId: displacedId, source: 'MANUAL' as const } : emptied(slot)
    }
    return slot
  })
}

export function removeFromBoard(slots: Slot[], characterId: number): Slot[] {
  return applyDrop(slots, characterId, { kind: 'bench' })
}

export function clearBoard(slots: Slot[]): Slot[] {
  return slots.map(emptied)
}

export function toSlotRequests(slots: Slot[]): SlotRequest[] {
  return slots.map(({ team, position, characterId, source }) => ({
    team,
    position,
    characterId,
    source: characterId === null ? null : (source ?? 'MANUAL'),
  }))
}

export function benchCharacters(participants: Character[], slots: Slot[]): Character[] {
  const placed = new Set(slots.map((slot) => slot.characterId).filter((id): id is number => id !== null))
  return participants.filter((character) => !placed.has(character.id))
}

export function emptySlotCount(slots: Slot[]): number {
  return slots.filter((slot) => slot.characterId === null).length
}

/** 두 보드 사이에서 캐릭터가 바뀐 슬롯의 드롭 id 목록 (자동배정 애니메이션용) */
export function changedSlotIds(before: Slot[], after: Slot[]): string[] {
  return after
    .filter((slot) => {
      const previous = slotAt(before, slot)
      return slot.characterId !== null && previous?.characterId !== slot.characterId
    })
    .map((slot) => slotDropId(slot.team, slot.position))
}

function emptied(slot: Slot): Slot {
  return { ...slot, characterId: null, source: null }
}

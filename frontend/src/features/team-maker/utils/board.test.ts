import { describe, expect, it } from 'vitest'
import type { Slot } from '@/api/types'
import {
  applyDrop,
  benchCharacters,
  changedSlotIds,
  clearBoard,
  emptySlotCount,
  normalizeSlots,
  slotAt,
  toSlotRequests,
} from './board'

const empty = normalizeSlots([])

function withSlot(slots: Slot[], team: Slot['team'], position: Slot['position'], characterId: number, source: Slot['source'] = 'MANUAL'): Slot[] {
  return slots.map((slot) => (slot.team === team && slot.position === position ? { ...slot, characterId, source } : slot))
}

describe('normalizeSlots', () => {
  it('항상 10개 슬롯을 BLUE→RED, TOP→SUPPORT 순으로 만든다', () => {
    expect(empty).toHaveLength(10)
    expect(empty[0]).toEqual({ team: 'BLUE', position: 'TOP', characterId: null, source: null })
    expect(empty[9]).toEqual({ team: 'RED', position: 'SUPPORT', characterId: null, source: null })
  })

  it('서버가 준 슬롯 값을 유지한다', () => {
    const slots = normalizeSlots([{ team: 'RED', position: 'MID', characterId: 7, source: 'AUTO' }])
    expect(slotAt(slots, { team: 'RED', position: 'MID' })).toEqual({
      team: 'RED',
      position: 'MID',
      characterId: 7,
      source: 'AUTO',
    })
  })
})

describe('applyDrop', () => {
  it('벤치 → 빈 슬롯: MANUAL 로 배치된다', () => {
    const result = applyDrop(empty, 1, { kind: 'slot', team: 'BLUE', position: 'TOP' })
    expect(slotAt(result, { team: 'BLUE', position: 'TOP' })).toMatchObject({ characterId: 1, source: 'MANUAL' })
    expect(emptySlotCount(result)).toBe(9)
    expect(empty[0].characterId).toBeNull() // 원본 불변
  })

  it('슬롯 → 다른 빈 슬롯: 이동하고 원래 자리는 비워진다', () => {
    const start = withSlot(empty, 'BLUE', 'TOP', 1, 'AUTO')
    const result = applyDrop(start, 1, { kind: 'slot', team: 'RED', position: 'MID' })
    expect(slotAt(result, { team: 'BLUE', position: 'TOP' })).toMatchObject({ characterId: null, source: null })
    expect(slotAt(result, { team: 'RED', position: 'MID' })).toMatchObject({ characterId: 1, source: 'MANUAL' })
  })

  it('사람이 있는 슬롯에 드롭하면 두 캐릭터가 SWAP 된다', () => {
    const start = withSlot(withSlot(empty, 'BLUE', 'TOP', 1), 'RED', 'ADC', 2, 'AUTO')
    const result = applyDrop(start, 1, { kind: 'slot', team: 'RED', position: 'ADC' })
    expect(slotAt(result, { team: 'RED', position: 'ADC' })).toMatchObject({ characterId: 1, source: 'MANUAL' })
    expect(slotAt(result, { team: 'BLUE', position: 'TOP' })).toMatchObject({ characterId: 2, source: 'MANUAL' })
  })

  it('벤치에서 사람이 있는 슬롯에 드롭하면 기존 캐릭터는 벤치로 돌아간다', () => {
    const start = withSlot(empty, 'BLUE', 'JUNGLE', 5)
    const result = applyDrop(start, 9, { kind: 'slot', team: 'BLUE', position: 'JUNGLE' })
    expect(slotAt(result, { team: 'BLUE', position: 'JUNGLE' })).toMatchObject({ characterId: 9 })
    expect(result.some((slot) => slot.characterId === 5)).toBe(false)
  })

  it('슬롯 → 벤치: 보드에서 제거된다', () => {
    const start = withSlot(empty, 'RED', 'SUPPORT', 3)
    const result = applyDrop(start, 3, { kind: 'bench' })
    expect(emptySlotCount(result)).toBe(10)
  })

  it('같은 슬롯에 다시 놓으면 아무 변화가 없다', () => {
    const start = withSlot(empty, 'RED', 'SUPPORT', 3, 'AUTO')
    const result = applyDrop(start, 3, { kind: 'slot', team: 'RED', position: 'SUPPORT' })
    expect(result).toBe(start)
  })

  it('벤치에 있는 캐릭터를 벤치에 놓으면 변화가 없다', () => {
    expect(applyDrop(empty, 42, { kind: 'bench' })).toBe(empty)
  })
})

describe('board helpers', () => {
  it('clearBoard 는 모든 슬롯을 비운다', () => {
    const start = withSlot(withSlot(empty, 'BLUE', 'TOP', 1), 'RED', 'ADC', 2)
    expect(emptySlotCount(clearBoard(start))).toBe(10)
  })

  it('toSlotRequests 는 source 를 보정한다', () => {
    const start = withSlot(empty, 'BLUE', 'TOP', 1, null)
    const requests = toSlotRequests(start)
    expect(requests[0]).toEqual({ team: 'BLUE', position: 'TOP', characterId: 1, source: 'MANUAL' })
    expect(requests[1]).toEqual({ team: 'BLUE', position: 'JUNGLE', characterId: null, source: null })
  })

  it('benchCharacters 는 보드에 없는 참가자만 돌려준다', () => {
    const participants = [{ id: 1 }, { id: 2 }, { id: 3 }] as Parameters<typeof benchCharacters>[0]
    const slots = withSlot(empty, 'BLUE', 'MID', 2)
    expect(benchCharacters(participants, slots).map((c) => c.id)).toEqual([1, 3])
  })

  it('changedSlotIds 는 새로 채워지거나 바뀐 슬롯만 찍는다', () => {
    const before = withSlot(empty, 'BLUE', 'TOP', 1)
    const after = withSlot(withSlot(before, 'BLUE', 'MID', 2, 'AUTO'), 'RED', 'TOP', 3, 'AUTO')
    expect(changedSlotIds(before, after)).toEqual(['slot:BLUE:MID', 'slot:RED:TOP'])
  })
})

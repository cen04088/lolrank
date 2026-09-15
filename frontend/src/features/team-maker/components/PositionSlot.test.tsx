import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import type { Character, Slot } from '@/api/types'
import { PositionSlot } from './PositionSlot'

const character: Character = {
  id: 7,
  roomId: 1,
  name: '민준',
  description: '라인전은 강하지만 한타에서 사라짐',
  assetKey: 'player_01',
  tier: 'GOLD',
  division: 4,
  tierLabel: 'Gold IV',
  mainPosition: 'TOP',
  subPositions: ['MID'],
  hierarchyRank: 'C',
  hierarchyOrder: 0,
  createdAt: '',
  updatedAt: '',
}

const emptySlot: Slot = { team: 'BLUE', position: 'TOP', characterId: null, source: null }

function renderSlot(props: Partial<Parameters<typeof PositionSlot>[0]> = {}) {
  return render(
    <DndContext>
      <ul>
        <PositionSlot slot={emptySlot} {...props} />
      </ul>
    </DndContext>,
  )
}

describe('PositionSlot', () => {
  it('빈 슬롯은 EMPTY 를 표시한다', () => {
    renderSlot()
    expect(screen.getByText('TOP')).toBeInTheDocument()
    expect(screen.getByText('빈 자리')).toBeInTheDocument()
  })

  it('드래그 중이면 DROP HERE 와 포지션 적합도 클래스를 표시한다', () => {
    const { container } = renderSlot({ activeCharacter: character })
    expect(screen.getByText('여기에 놓기')).toBeInTheDocument()
    const slot = container.querySelector('.trow')
    expect(slot).toHaveClass('trow--droppable')
    expect(slot).toHaveClass('trow--fit-main')
  })

  it('부 포지션 슬롯은 SUB, 그 외는 OFF 로 표시한다', () => {
    const { container: sub } = renderSlot({
      slot: { ...emptySlot, position: 'MID' },
      activeCharacter: character,
    })
    expect(sub.querySelector('.trow')).toHaveClass('trow--fit-sub')

    const { container: off } = renderSlot({
      slot: { ...emptySlot, position: 'ADC' },
      activeCharacter: character,
    })
    expect(off.querySelector('.trow')).toHaveClass('trow--fit-off')
  })

  it('배치된 캐릭터의 Compact Card 와 MANUAL 배지를 그린다', () => {
    renderSlot({
      slot: { ...emptySlot, characterId: character.id, source: 'MANUAL' },
      character,
    })
    expect(screen.getAllByText('민준').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gold IV').length).toBeGreaterThan(0)
    expect(screen.getByText('MANUAL')).toBeInTheDocument()
    expect(screen.getByText('라인전은 강하지만 한타에서 사라짐')).toBeInTheDocument()
  })
})

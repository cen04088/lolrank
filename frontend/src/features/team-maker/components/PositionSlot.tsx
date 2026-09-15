import type { CSSProperties } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Character, Slot } from '@/api/types'
import { PositionBadge } from '@/components/PositionBadge'
import { FIT_LABELS, positionFit } from '@/lib/labels'
import { slotDropId, type DropData } from '../utils/board'
import { CharacterChip } from './CharacterChip'

const POP_STAGGER_MS = 70

interface PositionSlotProps {
  slot: Slot
  character?: Character
  activeCharacter?: Character
  popIndex?: number
}

/** 팀 패널의 한 줄 = 하나의 포지션 슬롯(드롭 영역). */
export function PositionSlot({ slot, character, activeCharacter, popIndex }: PositionSlotProps) {
  const dropData: DropData = { kind: 'slot', team: slot.team, position: slot.position }
  const { setNodeRef, isOver } = useDroppable({ id: slotDropId(slot.team, slot.position), data: dropData })

  const fit = activeCharacter ? positionFit(activeCharacter, slot.position) : null
  const isSelf = activeCharacter !== undefined && activeCharacter.id === slot.characterId
  const dragging = activeCharacter !== undefined && !isSelf

  const classes = [
    'trow',
    `trow--${slot.team.toLowerCase()}`,
    character && 'trow--filled',
    dragging && 'trow--droppable',
    dragging && fit && `trow--fit-${fit.toLowerCase()}`,
    dragging && isOver && 'trow--over',
    popIndex !== undefined && 'trow--pop',
  ]
    .filter(Boolean)
    .join(' ')

  const style =
    popIndex !== undefined ? ({ '--pop-delay': `${popIndex * POP_STAGGER_MS}ms` } as CSSProperties) : undefined

  return (
    <li ref={setNodeRef} className={classes} style={style}>
      {character ? (
        <CharacterChip
          character={character}
          variant="row"
          team={slot.team}
          position={slot.position}
          from={{ kind: 'slot', team: slot.team, position: slot.position }}
          source={slot.source}
        />
      ) : (
        <div className="trow__empty">
          <PositionBadge position={slot.position} ghost />
          <span className="trow__empty-text font-pixel-ko">{dragging ? '여기에 놓기' : '빈 자리'}</span>
        </div>
      )}
      {dragging && isOver && fit && (
        <div className={`trow__hint trow__hint--${fit.toLowerCase()} font-pixel`}>{FIT_LABELS[fit]}</div>
      )}
    </li>
  )
}

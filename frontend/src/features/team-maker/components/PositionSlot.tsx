import type { CSSProperties } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Character, Slot } from '@/api/types'
import { FIT_LABELS, POSITION_ICONS, positionFit } from '@/lib/labels'
import { slotDropId, type DropData } from '../utils/board'
import { CharacterChip } from './CharacterChip'

const POP_STAGGER_MS = 70

interface PositionSlotProps {
  slot: Slot
  character?: Character
  activeCharacter?: Character
  popIndex?: number
}

export function PositionSlot({ slot, character, activeCharacter, popIndex }: PositionSlotProps) {
  const dropData: DropData = { kind: 'slot', team: slot.team, position: slot.position }
  const { setNodeRef, isOver } = useDroppable({ id: slotDropId(slot.team, slot.position), data: dropData })

  const fit = activeCharacter ? positionFit(activeCharacter, slot.position) : null
  const isSelf = activeCharacter !== undefined && activeCharacter.id === slot.characterId

  const classes = [
    'tm-slot',
    `tm-slot--${slot.team.toLowerCase()}`,
    character && 'tm-slot--filled',
    activeCharacter && !isSelf && 'tm-slot--droppable',
    fit && !isSelf && `tm-slot--fit-${fit.toLowerCase()}`,
    isOver && !isSelf && 'tm-slot--over',
    popIndex !== undefined && 'tm-slot--pop',
  ]
    .filter(Boolean)
    .join(' ')

  const style =
    popIndex !== undefined ? ({ '--pop-delay': `${popIndex * POP_STAGGER_MS}ms` } as CSSProperties) : undefined

  return (
    <li ref={setNodeRef} className={classes} style={style}>
      <div className="tm-slot__label">
        <span className="tm-slot__icon" aria-hidden>
          {POSITION_ICONS[slot.position]}
        </span>
        <span className="tm-slot__pos font-pixel">{slot.position}</span>
      </div>
      <div className="tm-slot__body">
        {character ? (
          <CharacterChip
            character={character}
            from={{ kind: 'slot', team: slot.team, position: slot.position }}
            source={slot.source}
          />
        ) : (
          <div className="tm-slot__empty font-pixel">{activeCharacter && !isSelf ? 'DROP HERE' : 'EMPTY'}</div>
        )}
      </div>
      {isOver && fit && !isSelf && (
        <div className={`tm-slot__hint tm-slot__hint--${fit.toLowerCase()} font-pixel`}>{FIT_LABELS[fit]}</div>
      )}
    </li>
  )
}

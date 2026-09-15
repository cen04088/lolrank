import type { Character, Slot, Team } from '@/api/types'
import { PixelPanel } from '@/components/PixelPanel'
import { slotDropId } from '../utils/board'
import { PositionSlot } from './PositionSlot'

interface TeamColumnProps {
  team: Team
  slots: Slot[]
  charactersById: Map<number, Character>
  activeCharacter?: Character
  popSlots: Record<string, number>
}

export function TeamColumn({ team, slots, charactersById, activeCharacter, popSlots }: TeamColumnProps) {
  const filled = slots.filter((slot) => slot.characterId !== null).length
  return (
    <PixelPanel
      tone={team === 'BLUE' ? 'blue' : 'red'}
      className={`tm-col tm-col--${team.toLowerCase()}`}
      title={
        <>
          <span className="tm-col__flag" aria-hidden />
          {team} TEAM
          <span className="tm-col__count">
            {filled}/{slots.length}
          </span>
        </>
      }
    >
      <ul className="tm-col__slots">
        {slots.map((slot) => (
          <PositionSlot
            key={slot.position}
            slot={slot}
            character={slot.characterId !== null ? charactersById.get(slot.characterId) : undefined}
            activeCharacter={activeCharacter}
            popIndex={popSlots[slotDropId(slot.team, slot.position)]}
          />
        ))}
      </ul>
    </PixelPanel>
  )
}

import type { Character, Slot, Team } from '@/api/types'
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
    <section className={`tcol tcol--${team.toLowerCase()}`} aria-label={`${team} TEAM`}>
      <header className="tcol__head">
        <h2 className="tcol__title font-pixel">{team} TEAM</h2>
        <span className="tcol__count font-pixel">
          {filled}/{slots.length}
        </span>
      </header>
      <ul className="tcol__rows">
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
    </section>
  )
}

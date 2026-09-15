import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import type { Character, HierarchyRank } from '@/api/types'
import { RANK_LABELS } from '@/lib/labels'
import { cardSortId, rankDropId } from '../utils/hierarchy'
import { TrophyCard } from './TrophyCard'

const RANK_ICONS: Record<HierarchyRank, string> = {
  LEGEND: '👑',
  S: '🏆',
  A: '🥇',
  B: '🥈',
  C: '🥉',
}

interface RankRowProps {
  rank: HierarchyRank
  characters: Character[]
  dragging: boolean
}

export function RankRow({ rank, characters, dragging }: RankRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: rankDropId(rank) })
  const classes = [
    'hier-row',
    `hier-row--${rank.toLowerCase()}`,
    dragging && 'hier-row--droppable',
    isOver && 'hier-row--over',
    characters.length === 0 && 'hier-row--empty',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={classes} aria-label={RANK_LABELS[rank]}>
      <header className="hier-row__head">
        <span className="hier-row__icon" aria-hidden>
          {RANK_ICONS[rank]}
        </span>
        <h2 className="hier-row__title font-pixel">{RANK_LABELS[rank]}</h2>
        <span className="hier-row__count font-pixel">{characters.length}</span>
      </header>
      <SortableContext items={characters.map((c) => cardSortId(c.id))} strategy={rectSortingStrategy}>
        <div ref={setNodeRef} className="hier-row__cards">
          {characters.length === 0 ? (
            <div className="hier-row__placeholder font-pixel">{dragging ? 'DROP HERE' : 'EMPTY'}</div>
          ) : (
            characters.map((character) => <TrophyCard key={character.id} character={character} rank={rank} />)
          )}
        </div>
      </SortableContext>
    </section>
  )
}

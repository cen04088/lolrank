import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import type { Character, HierarchyRank } from '@/api/types'
import { RANK_LABELS } from '@/lib/labels'
import { cardSortId, rankDropId } from '../utils/hierarchy'
import { TrophyCard } from './TrophyCard'

const EMPTY_PLACEHOLDERS = 4

interface RankRowProps {
  rank: HierarchyRank
  characters: Character[]
  dragging: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

/** 타워의 한 층. LEGEND 가 가장 좁고 C 가 가장 넓다. */
export function RankRow({ rank, characters, dragging, selectedId, onSelect }: RankRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: rankDropId(rank) })
  const classes = [
    'floor',
    `floor--${rank.toLowerCase()}`,
    dragging && 'floor--droppable',
    isOver && 'floor--over',
    characters.length === 0 && 'floor--empty',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={classes} aria-label={RANK_LABELS[rank]}>
      <div className="floor__plaque">
        {rank === 'LEGEND' && (
          <span className="floor__crown" aria-hidden>
            👑
          </span>
        )}
        <span className="floor__plaque-text font-pixel">{RANK_LABELS[rank]}</span>
      </div>
      <SortableContext items={characters.map((c) => cardSortId(c.id))} strategy={rectSortingStrategy}>
        <div ref={setNodeRef} className="floor__cards">
          {characters.length === 0
            ? Array.from({ length: rank === 'LEGEND' ? 1 : EMPTY_PLACEHOLDERS }, (_, index) => (
                <div key={index} className="floor__slot font-pixel">
                  {dragging ? '▼' : '+'}
                </div>
              ))
            : characters.map((character) => (
                <TrophyCard
                  key={character.id}
                  character={character}
                  rank={rank}
                  selected={character.id === selectedId}
                  onSelect={() => onSelect(character.id)}
                />
              ))}
        </div>
      </SortableContext>
    </section>
  )
}

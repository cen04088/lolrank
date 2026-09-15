import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Character, HierarchyRank } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { TIER_COLORS, positionSummary } from '@/lib/labels'
import { cardSortId } from '../utils/hierarchy'

interface TrophyCardProps {
  character: Character
  rank: HierarchyRank
  overlay?: boolean
}

/** 계급도용 Trophy Card. 캐릭터와 이름 중심. LEGEND 는 크게. */
export function TrophyCard({ character, rank, overlay = false }: TrophyCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: overlay ? `overlay:${cardSortId(character.id)}` : cardSortId(character.id),
    disabled: overlay,
  })

  const legend = rank === 'LEGEND'
  const size = legend ? 88 : 64
  const style: CSSProperties = overlay
    ? ({ '--tier-color': TIER_COLORS[character.tier] } as CSSProperties)
    : ({
        '--tier-color': TIER_COLORS[character.tier],
        transform: CSS.Transform.toString(transform),
        transition,
      } as CSSProperties)

  const classes = [
    'hier-card',
    legend && 'hier-card--legend',
    isDragging && 'hier-card--dragging',
    overlay && 'hier-card--overlay',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={classes}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      title={character.description ?? character.name}
    >
      {legend && (
        <span className="hier-card__crown" aria-hidden>
          👑
        </span>
      )}
      <div className="hier-card__stage">
        <PixelAvatar assetKey={character.assetKey} size={size} />
      </div>
      <div className="hier-card__name">{character.name}</div>
      <div className="hier-card__tier font-pixel">{character.tierLabel}</div>
      <div className="hier-card__pos">{positionSummary(character)}</div>
    </div>
  )
}

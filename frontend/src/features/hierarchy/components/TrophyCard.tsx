import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Character, HierarchyRank } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { TIER_COLORS } from '@/lib/labels'
import { cardSortId } from '../utils/hierarchy'

interface TrophyCardProps {
  character: Character
  rank: HierarchyRank
  overlay?: boolean
  selected?: boolean
  onSelect?: () => void
}

/** 계급도 타워 위의 선수 카드: 스프라이트 + 이름표. LEGEND 는 크게. */
export function TrophyCard({ character, rank, overlay = false, selected = false, onSelect }: TrophyCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: overlay ? `overlay:${cardSortId(character.id)}` : cardSortId(character.id),
    disabled: overlay,
  })

  const legend = rank === 'LEGEND'
  const size = legend ? 84 : 60
  const style: CSSProperties = overlay
    ? ({ '--tier-color': TIER_COLORS[character.tier] } as CSSProperties)
    : ({
        '--tier-color': TIER_COLORS[character.tier],
        transform: CSS.Transform.toString(transform),
        transition,
      } as CSSProperties)

  const classes = [
    'trophy',
    legend && 'trophy--legend',
    selected && 'trophy--selected',
    isDragging && 'trophy--dragging',
    overlay && 'trophy--overlay',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={classes}
      style={style}
      title={character.description ?? character.name}
      onClick={overlay ? undefined : onSelect}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
    >
      <div className="trophy__stage">
        <PixelAvatar assetKey={character.assetKey} size={size} />
      </div>
      <div className="trophy__plate">
        <span className="trophy__name font-pixel-ko">{character.name}</span>
        <span className="trophy__tier font-pixel">{character.tierLabel}</span>
      </div>
    </div>
  )
}

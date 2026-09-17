import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Character, HierarchyRank } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { TIER_COLORS, rankScore } from '@/lib/labels'
import { cardSortId } from '../utils/hierarchy'

interface TrophyCardProps {
  character: Character
  rank: HierarchyRank
  /** 같은 계급 안의 순번(0 = 맨 앞)과 인원. 없으면 점수를 표시하지 않는다 */
  indexInRank?: number
  countInRank?: number
  overlay?: boolean
  selected?: boolean
  onSelect?: () => void
}

/** 계급도 타워 위의 선수 카드: 스프라이트 + 이름표. LEGEND 는 크게. */
export function TrophyCard({ character, rank, indexInRank, countInRank, overlay = false, selected = false, onSelect }: TrophyCardProps) {
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
        {character.title && <span className="trophy__title font-pixel-ko">✦ {character.title}</span>}
        <span className="trophy__name font-pixel-ko">{character.name}</span>
        <span className="trophy__tier font-pixel">{character.tierLabel}</span>
        {indexInRank !== undefined && countInRank !== undefined && (
          <span className="trophy__score font-pixel" title={`등급 점수 (계급 안 ${indexInRank + 1}/${countInRank}위)`}>
            {rankScore(rank, indexInRank, countInRank)}
          </span>
        )}
      </div>
    </div>
  )
}

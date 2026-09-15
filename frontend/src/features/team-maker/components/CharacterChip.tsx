import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { AssignmentSource, Character } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { POSITION_LABELS, TIER_COLORS, positionSummary } from '@/lib/labels'
import { characterDragId, type DragData } from '../utils/board'

interface CharacterChipProps {
  character: Character
  from?: DragData['from']
  source?: AssignmentSource | null
  /** DragOverlay 안에서 그려지는 복제본. 드래그 불가, 툴팁 없음. */
  overlay?: boolean
}

/** Team Maker 용 Compact Card. 드래그 가능한 유일한 요소. */
export function CharacterChip({ character, from = { kind: 'bench' }, source, overlay = false }: CharacterChipProps) {
  const dragData: DragData = { characterId: character.id, from }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: overlay ? `overlay:${characterDragId(character.id)}` : characterDragId(character.id),
    data: dragData,
    disabled: overlay,
  })

  const classes = ['tm-chip', isDragging && 'tm-chip--dragging', overlay && 'tm-chip--overlay']
    .filter(Boolean)
    .join(' ')
  const tierStyle = { '--tier-color': TIER_COLORS[character.tier] } as CSSProperties

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={classes}
      style={tierStyle}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
    >
      <PixelAvatar assetKey={character.assetKey} size={40} alt="" />
      <div className="tm-chip__info">
        <div className="tm-chip__name">{character.name}</div>
        <div className="tm-chip__tier font-pixel">{character.tierLabel}</div>
        <div className="tm-chip__pos">{positionSummary(character)}</div>
      </div>
      {source && <span className={`tm-chip__source tm-chip__source--${source.toLowerCase()} font-pixel`}>{source}</span>}
      {!overlay && (
        <div className="tm-chip__tooltip" role="tooltip">
          <div className="tm-chip__tooltip-head">
            <PixelAvatar assetKey={character.assetKey} size={48} alt="" />
            <div>
              <div className="tm-chip__tooltip-name">{character.name}</div>
              <div className="tm-chip__tier font-pixel">{character.tierLabel}</div>
            </div>
          </div>
          <dl className="tm-chip__tooltip-grid">
            <dt className="font-pixel">MAIN</dt>
            <dd>{POSITION_LABELS[character.mainPosition]}</dd>
            <dt className="font-pixel">SUB</dt>
            <dd>{character.subPosition ? POSITION_LABELS[character.subPosition] : '—'}</dd>
          </dl>
          {character.description && <p className="tm-chip__tooltip-desc">“{character.description}”</p>}
        </div>
      )}
    </div>
  )
}

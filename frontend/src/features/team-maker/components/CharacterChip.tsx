import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { AssignmentSource, Character, Position, Team } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PositionBadge } from '@/components/PositionBadge'
import { TIER_COLORS, positionSummary } from '@/lib/labels'
import { characterDragId, type DragData } from '../utils/board'

type Variant = 'row' | 'bench' | 'overlay'

interface CharacterChipProps {
  character: Character
  variant: Variant
  /** row 변형에서 좌우 방향을 결정한다 (RED 는 오른쪽 정렬). */
  team?: Team
  /** row 변형에서 표시할 배치 포지션 배지 */
  position?: Position
  from?: DragData['from']
  source?: AssignmentSource | null
}

/**
 * 드래그 가능한 캐릭터 카드.
 * - row: 팀 패널 한 줄 (아바타 · 이름/티어 · 포지션 배지 · 한 줄 소감 말풍선)
 * - bench: 중앙 잔디의 대기 선수 (compact)
 * - overlay: 드래그 중 포인터를 따라다니는 복제본 (드래그 불가)
 */
export function CharacterChip({
  character,
  variant,
  team = 'BLUE',
  position,
  from = { kind: 'bench' },
  source,
}: CharacterChipProps) {
  const overlay = variant === 'overlay'
  const dragData: DragData = { characterId: character.id, from }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: overlay ? `overlay:${characterDragId(character.id)}` : characterDragId(character.id),
    data: dragData,
    disabled: overlay,
  })

  const classes = [
    'chip',
    `chip--${variant}`,
    variant === 'row' && `chip--${team.toLowerCase()}`,
    isDragging && 'chip--dragging',
  ]
    .filter(Boolean)
    .join(' ')
  const style = { '--tier-color': TIER_COLORS[character.tier] } as CSSProperties

  const dragProps = overlay ? {} : { ...listeners, ...attributes }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={classes}
      style={style}
      title={character.description ?? character.name}
      {...dragProps}
    >
      <PixelAvatar assetKey={character.assetKey} size={variant === 'row' ? 44 : 36} alt="" />
      <div className="chip__info">
        <div className="chip__name font-pixel-ko">{character.name}</div>
        <div className="chip__tier font-pixel">{character.tierLabel}</div>
        {variant !== 'row' && <div className="chip__pos">{positionSummary(character)}</div>}
      </div>
      {variant === 'row' && position && <PositionBadge position={position} className="chip__badge" />}
      {variant === 'row' && (
        <div className={`chip__bubble bubble ${team === 'BLUE' ? 'bubble--left' : 'bubble--right'}`}>
          {character.description ?? positionSummary(character)}
        </div>
      )}
      {source && <span className={`chip__source chip__source--${source.toLowerCase()} font-pixel`}>{source}</span>}
    </div>
  )
}

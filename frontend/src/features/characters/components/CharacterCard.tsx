import type { CSSProperties } from 'react'
import type { Character } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PositionTag } from '@/components/PositionTag'
import { TierBadge } from '@/components/TierBadge'
import { RANK_LABELS, TIER_COLORS } from '@/lib/labels'

interface CharacterCardProps {
  character: Character
  onEdit: () => void
  onDelete: () => void
}

/** Character Management 용 큰 카드. */
export function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  const style = { '--tier-color': TIER_COLORS[character.tier] } as CSSProperties
  return (
    <article className="char-card" style={style}>
      <div className="char-card__stage">
        <PixelAvatar assetKey={character.assetKey} size={96} alt={character.name} />
        <span className="char-card__rank font-pixel">{RANK_LABELS[character.hierarchyRank]}</span>
      </div>
      <div className="char-card__body">
        <h3 className="char-card__name">{character.name}</h3>
        <TierBadge tier={character.tier} division={character.division} size="lg" />
        <dl className="char-card__positions">
          <div>
            <dt className="font-pixel">MAIN</dt>
            <dd>
              <PositionTag position={character.mainPosition} kind="main" showIcon />
            </dd>
          </div>
          <div>
            <dt className="font-pixel">SUB</dt>
            <dd>{character.subPosition ? <PositionTag position={character.subPosition} kind="sub" showIcon /> : <span className="text-muted">—</span>}</dd>
          </div>
        </dl>
        <p className="char-card__desc">{character.description ? `“${character.description}”` : '한 줄 설명이 없습니다.'}</p>
      </div>
      <footer className="char-card__actions">
        <PixelButton size="sm" variant="blue" onClick={onEdit}>
          수정
        </PixelButton>
        <PixelButton size="sm" variant="ghost" onClick={onDelete}>
          삭제
        </PixelButton>
      </footer>
    </article>
  )
}

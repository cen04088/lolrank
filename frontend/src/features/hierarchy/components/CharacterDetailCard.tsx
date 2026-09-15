import { HIERARCHY_RANKS, type Character, type HierarchyRank } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PositionBadge } from '@/components/PositionBadge'
import { TierBadge } from '@/components/TierBadge'
import { RANK_LABELS } from '@/lib/labels'

interface CharacterDetailCardProps {
  character?: Character
  onChangeRank: (rank: HierarchyRank) => void
  onEdit: () => void
  onDelete: () => void
}

/** 계급도 우측 상세 카드 (초안의 민준 / Gold IV / 소개 / 버튼 영역). */
export function CharacterDetailCard({ character, onChangeRank, onEdit, onDelete }: CharacterDetailCardProps) {
  if (!character) {
    return (
      <section className="detail detail--empty">
        <p className="font-pixel-ko">선수를 클릭하면 상세 정보가 여기에 표시됩니다.</p>
      </section>
    )
  }

  return (
    <section className="detail" aria-label={`${character.name} 상세`}>
      <header className="detail__head">
        <div className="detail__avatar">
          <PixelAvatar assetKey={character.assetKey} size={64} variant="face" />
        </div>
        <div className="detail__title">
          <h3 className="detail__name font-pixel-ko">{character.name}</h3>
          <TierBadge tier={character.tier} division={character.division} />
        </div>
      </header>

      <p className="detail__quote">{character.description ? `"${character.description}"` : '한 줄 설명이 없습니다.'}</p>

      <dl className="detail__stats">
        <div>
          <dt>계급</dt>
          <dd className="font-pixel text-gold">{RANK_LABELS[character.hierarchyRank]}</dd>
        </div>
        <div>
          <dt>주 포지션</dt>
          <dd>
            <PositionBadge position={character.mainPosition} />
          </dd>
        </div>
        <div>
          <dt>부 포지션</dt>
          <dd>{character.subPosition ? <PositionBadge position={character.subPosition} ghost /> : '—'}</dd>
        </div>
        <div>
          <dt>등록일</dt>
          <dd>{formatDate(character.createdAt)}</dd>
        </div>
      </dl>

      <div className="detail__actions">
        <label className="detail__rank-select">
          <span className="px-label">등급 변경</span>
          <select
            className="px-select"
            value={character.hierarchyRank}
            onChange={(event) => onChangeRank(event.target.value as HierarchyRank)}
          >
            {HIERARCHY_RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {RANK_LABELS[rank]}
              </option>
            ))}
          </select>
        </label>
        <PixelButton variant="blue" fullWidth onClick={onEdit}>
          소개 수정
        </PixelButton>
        <PixelButton variant="red" fullWidth onClick={onDelete}>
          삭제
        </PixelButton>
      </div>
    </section>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

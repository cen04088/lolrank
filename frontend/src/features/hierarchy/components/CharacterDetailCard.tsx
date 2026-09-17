import { HIERARCHY_RANKS, type Character, type HierarchyRank, type Rating } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PositionBadge } from '@/components/PositionBadge'
import { RatingBadge } from '@/components/RatingBadge'
import { TierBadge } from '@/components/TierBadge'
import { TitleTag } from '@/components/TitleTag'
import { RANK_LABELS } from '@/lib/labels'

interface CharacterDetailCardProps {
  character?: Character
  rating?: Rating
  onChangeRank: (rank: HierarchyRank) => void
  onEdit: () => void
  onDelete: () => void
}

/** 계급도 우측 상세 카드 (초안의 민준 / Gold IV / 소개 / 버튼 영역). */
export function CharacterDetailCard({ character, rating, onChangeRank, onEdit, onDelete }: CharacterDetailCardProps) {
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
          <div className="detail__namewrap">
            <h3 className="detail__name font-pixel-ko">{character.name}</h3>
            <TitleTag title={character.title} />
          </div>
          <TierBadge tier={character.tier} division={character.division} />
        </div>
      </header>

      <p className="detail__quote">{character.description ? `"${character.description}"` : '한 줄 설명이 없습니다.'}</p>

      <dl className="detail__stats">
        <div>
          <dt>계급</dt>
          <dd className="font-pixel text-gold">{RANK_LABELS[character.hierarchyRank]}</dd>
        </div>
        {rating && rating.played > 0 && (
          <div className="detail__wide">
            <dt>기록 보정</dt>
            <dd>
              <RatingBadge rating={rating} variant="full" /> <small className="detail__hint">전투력 {rating.baseStrength} → {rating.strength}</small>
            </dd>
          </div>
        )}
        {character.champions && (
          <div className="detail__wide">
            <dt>주 챔피언</dt>
            <dd>{character.champions}</dd>
          </div>
        )}
        <div>
          <dt>주 포지션</dt>
          <dd>
            <PositionBadge position={character.mainPosition} />
          </dd>
        </div>
        <div>
          <dt>부 포지션</dt>
          <dd className="detail__subs">
            {character.subPositions.length === 0
              ? '—'
              : character.subPositions.map((position) => <PositionBadge key={position} position={position} ghost />)}
          </dd>
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

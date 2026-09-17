import type { CSSProperties } from 'react'
import type { Character } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PositionBadge } from '@/components/PositionBadge'
import { TierBadge } from '@/components/TierBadge'
import { TitleTag } from '@/components/TitleTag'
import { isSpecialAsset } from '@/lib/assets'
import { RANK_LABELS, TIER_COLORS } from '@/lib/labels'

interface CharacterCardProps {
  character: Character
  onEdit: () => void
  onDelete: () => void
}

/** 선수 명단용 큰 카드: 잔디 무대 위 스프라이트 + 이름/티어/포지션 + 한 줄 소개. */
export function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  const style = { '--tier-color': TIER_COLORS[character.tier] } as CSSProperties
  // 투명 배경 특수 인물 일러스트는 잔디 무대 대신 전용 무대에 크게 얹는다.
  const special = isSpecialAsset(character.assetKey)
  return (
    <article className={special ? 'ccard ccard--special' : 'ccard'} style={style}>
      <div className="ccard__stage">
        <PixelAvatar assetKey={character.assetKey} size={special ? 132 : 96} alt={character.name} />
        <span className="ccard__rank font-pixel-ko">{RANK_LABELS[character.hierarchyRank]}</span>
      </div>
      <div className="ccard__body">
        <div className="ccard__title">
          <div className="ccard__namewrap">
            <h3 className="ccard__name font-pixel-ko">{character.name}</h3>
            <TitleTag title={character.title} />
          </div>
          <TierBadge tier={character.tier} division={character.division} />
        </div>
        {character.champions && (
          <p className="ccard__champs" title="주 챔피언">
            <span aria-hidden>🗡</span> {character.champions}
          </p>
        )}
        <div className="ccard__positions">
          <PositionBadge position={character.mainPosition} />
          {character.subPositions.map((position) => (
            <PositionBadge key={position} position={position} ghost />
          ))}
        </div>
        <p className="ccard__desc bubble bubble--left">
          {character.description ? character.description : '한 줄 소개가 없습니다.'}
        </p>
      </div>
      <footer className="ccard__actions">
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

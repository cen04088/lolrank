import { PixelAvatar } from './PixelAvatar'
import { PLAYER_ASSET_KEYS } from '@/lib/assets'
import './player-badge.css'

interface PlayerBadgeProps {
  nickname: string
  subtitle?: string
  bubble?: string
  onClick?: () => void
}

/** 닉네임으로 항상 같은 스프라이트를 고른다 (닉네임 = 인증이 아니라 표시용). */
export function avatarForNickname(nickname: string): string {
  let hash = 0
  for (let i = 0; i < nickname.length; i++) hash = (hash * 31 + nickname.charCodeAt(i)) >>> 0
  return PLAYER_ASSET_KEYS[hash % PLAYER_ASSET_KEYS.length]
}

/** 좌측 상단 내 플레이어 카드 + 말풍선. */
export function PlayerBadge({ nickname, subtitle, bubble, onClick }: PlayerBadgeProps) {
  return (
    <div className="pbadge">
      <button type="button" className="pbadge__card" onClick={onClick} title="닉네임 변경">
        <PixelAvatar assetKey={avatarForNickname(nickname)} size={44} />
        <span className="pbadge__text">
          <span className="pbadge__name">{nickname}</span>
          {subtitle && <span className="pbadge__sub">{subtitle}</span>}
        </span>
      </button>
      {bubble && <div className="pbadge__bubble">{bubble}</div>}
    </div>
  )
}

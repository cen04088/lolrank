import { NavLink } from 'react-router-dom'
import { useBgm } from '@/components/Bgm'
import './game-nav.css'

interface GameNavProps {
  code: string
  onOpenSettings: () => void
}

const ITEMS = [
  { to: '', label: '홈', icon: '🏠', end: true },
  { to: '/team', label: '팀 배정', icon: '⚔️', end: false },
  { to: '/characters', label: '캐릭터', icon: '👥', end: false },
  { to: '/hierarchy', label: '계급도', icon: '👑', end: false },
] as const

/** 우측 상단 게임 메뉴 바 (초안 디자인의 홈/팀 배정/캐릭터/계급도/설정). */
export function GameNav({ code, onOpenSettings }: GameNavProps) {
  const bgm = useBgm()
  return (
    <nav className="gnav" aria-label="메인 메뉴">
      <NavLink to={`/room/${code}`} end className="gnav__brand" aria-label="LOL RANK 홈">
        <span className="gnav__brand-crown" aria-hidden>♛</span>
        <span>
          <strong>LOL RANK</strong>
          <small>PRIVATE LEAGUE</small>
        </span>
      </NavLink>
      <div className="gnav__links">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={`/room/${code}${item.to}`} end={item.end} className="gnav__item">
            <span className="gnav__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="gnav__label">{item.label}</span>
          </NavLink>
        ))}
        {bgm && !bgm.unsupported && (
          <button
            type="button"
            className={bgm.enabled ? 'gnav__item gnav__item--on' : 'gnav__item'}
            onClick={bgm.toggle}
            aria-pressed={bgm.enabled}
            aria-label={bgm.enabled ? `배경음악 끄기${bgm.nowPlaying ? ` (재생 중: ${bgm.nowPlaying})` : ''}` : '배경음악 켜기'}
            title={bgm.nowPlaying ? `♪ ${bgm.nowPlaying}` : '배경음악'}
          >
            <span className="gnav__icon" aria-hidden>
              {bgm.enabled ? '🎵' : '🔇'}
            </span>
            <span className="gnav__label">BGM</span>
          </button>
        )}
        <button type="button" className="gnav__item" onClick={onOpenSettings}>
          <span className="gnav__icon" aria-hidden>
            ⚙️
          </span>
          <span className="gnav__label">설정</span>
        </button>
      </div>
    </nav>
  )
}

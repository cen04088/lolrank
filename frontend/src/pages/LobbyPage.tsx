import { Link } from 'react-router-dom'
import { useCharacters } from '@/api/queries'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PlayerBadge } from '@/components/PlayerBadge'
import { Scene } from '@/components/Scene'
import { useRoomCode, useRoomContext } from '@/pages/RoomLayout'
import './lobby.css'

const PARADE_MAX = 8

const GREETINGS = ['오늘도 즐거운 한 판!', '좋은 팀은 좋은 친구로부터!', '오늘의 전설은 누구?', 'GG는 마음으로!']

/** 방 입장 첫 화면: 마을 광장 로비. */
export function LobbyPage() {
  const code = useRoomCode()
  const { room, nickname, openSettings } = useRoomContext()
  const characters = useCharacters(code)

  const parade = (characters.data ?? []).slice(0, PARADE_MAX)
  const greeting = GREETINGS[nickname.length % GREETINGS.length]

  return (
    <Scene kind="village">
      <PlayerBadge nickname={nickname || '...'} subtitle={room.name} bubble={greeting} onClick={openSettings} />

      <main className="lobby">
        <header className="lobby__logo logo">
          <span className="logo__crown" aria-hidden>
            👑
          </span>
          <h1 className="logo__text">LOL RANK</h1>
          <p className="logo__sub">우리들의 내전, 더 특별하게</p>
        </header>

        <div className="lobby__notice paper">
          <p className="lobby__notice-title">{room.name}</p>
          <p className="lobby__notice-sub">
            초대 코드 <strong className="font-pixel">#{room.inviteCode}</strong>
          </p>
          <p className="lobby__notice-text">좋은 팀은 좋은 친구로부터!</p>
        </div>

        <div className="lobby__gates">
          <Gate
            tone="blue"
            icon="⚔"
            title="5 vs 5 팀 배정"
            description={['공정한 팀으로,', '더 재미있는 한 판!']}
            to={`/room/${code}/team`}
          />
          <Gate
            tone="red"
            icon="👑"
            title="롤 랭크 계급도"
            description={['우리만의 랭크,', '전설을 만들어보세요!']}
            to={`/room/${code}/hierarchy`}
          />
        </div>

        <div className="lobby__plaza">
          <div className="fountain" aria-hidden>
            <span className="fountain__water" />
            <span className="fountain__orb" />
          </div>
          <ul className="parade" aria-label="이 방의 선수들">
            {parade.map((character, index) => (
              <li
                key={character.id}
                className="parade__player"
                style={{ animationDelay: `${index * 350}ms`, animationDuration: `${6 + (index % 3)}s` }}
                title={character.name}
              >
                <PixelAvatar assetKey={character.assetKey} size={44} />
                <span className="parade__name">{character.name}</span>
              </li>
            ))}
          </ul>
          {characters.data && characters.data.length === 0 && (
            <div className="lobby__empty bubble bubble--left">
              아직 선수가 없어요. 캐릭터를 만들어 광장을 채워보세요!
            </div>
          )}
        </div>

        <div className="lobby__signs">
          <div className="sign sign--left">
            <span>GOOD GAME</span>
            <span>GOOD FRIENDS</span>
          </div>
          <Link to={`/room/${code}/characters`} className="sign sign--center">
            <span>🎽 선수 등록소</span>
            <span className="sign__sub">캐릭터 만들기 · 수정 →</span>
          </Link>
          <div className="sign sign--right">
            <span>PLAY · RANK UP</span>
            <span>BE A LEGEND</span>
          </div>
        </div>
      </main>
    </Scene>
  )
}

interface GateProps {
  tone: 'blue' | 'red'
  icon: string
  title: string
  description: string[]
  to: string
}

function Gate({ tone, icon, title, description, to }: GateProps) {
  return (
    <div className={`gate gate--${tone}`}>
      <div className="gate__dome">
        <span className="gate__icon" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="gate__body">
        <h2 className="gate__title">{title}</h2>
        <p className="gate__desc">
          {description.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <Link to={to}>
          <PixelButton variant={tone} size="lg" fullWidth>
            입장하기 ›
          </PixelButton>
        </Link>
      </div>
      <div className="gate__steps" aria-hidden />
    </div>
  )
}

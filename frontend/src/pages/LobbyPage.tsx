import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SupportModal } from '@/components/SupportModal'
import { useCharacters } from '@/api/queries'
import { isSpecialAsset } from '@/lib/assets'
import { WalkingSprite } from '@/components/WalkingSprite'
import { PlayerBadge } from '@/components/PlayerBadge'
import { Scene } from '@/components/Scene'
import { tinyPropUrl } from '@/lib/assets'
import { useRoomCode, useRoomContext } from '@/pages/RoomLayout'
import './lobby.css'

const PARADE_MAX = 8

const GREETINGS = ['오늘도 즐거운 한 판!', '오늘의 전설은 누구?', 'GG는 마음으로!']

/** 방 입장 첫 화면: 마을 광장 로비. */
export function LobbyPage() {
  const code = useRoomCode()
  const { room, nickname, openSettings } = useRoomContext()
  const [supportOpen, setSupportOpen] = useState(false)
  const characters = useCharacters(code)

  // 특수 인물 초상화는 걷는 모션이 없으므로 행진에서 뺀다.
  const parade = (characters.data ?? []).filter((c) => !isSpecialAsset(c.assetKey)).slice(0, PARADE_MAX)
  const greeting = GREETINGS[nickname.length % GREETINGS.length]

  return (
    <Scene kind="village">
      <PlayerBadge nickname={nickname || '...'} subtitle={room.name} bubble={greeting} onClick={openSettings} />

      <main className="lobby">
        <header className="lobby__logo logo">
          <span className="lobby__eyebrow font-pixel">PRIVATE LEAGUE · SEASON 01</span>
          <span className="logo__crown" aria-hidden>
            ♛
          </span>
          <h1 className="logo__text">LOL RANK</h1>
          <p className="logo__sub">우리들의 내전, 더 특별하게</p>
        </header>

        <div className="lobby__notice paper">
          <p className="lobby__notice-title">{room.name}</p>
          <p className="lobby__notice-sub">선수 {characters.data?.length ?? 0}명 등록</p>
        </div>

        <div className="lobby__gates">
          <Gate
            tone="blue"
            building="castle_blue"
            title="5 vs 5 팀 배정"
            description={['공정한 팀으로,', '더 재미있는 한 판!']}
            to={`/room/${code}/team`}
          />
          <Gate
            tone="red"
            building="castle_red"
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
                style={{ animationDelay: `${-index * 2.3}s`, animationDuration: `${14 + (index % 4) * 3}s` }}
                title={character.name}
              >
                <WalkingSprite assetKey={character.assetKey} direction="right" size={64} />
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
          <button type="button" className="sign sign--right sign--support" onClick={() => setSupportOpen(true)}>
            <span>💛 후원하기</span>
            <span className="sign__sub">AI 토큰 · 서버비</span>
          </button>
        </div>
      </main>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </Scene>
  )
}

interface GateProps {
  tone: 'blue' | 'red'
  /** Tiny Swords 건물 소품 이름 */
  building: string
  title: string
  description: string[]
  to: string
}

function Gate({ tone, building, title, description, to }: GateProps) {
  return (
    <div className={`gate gate--${tone}`}>
      <span className="gate__flag font-pixel" aria-hidden>{tone === 'blue' ? 'BLUE GATE' : 'ROYAL HALL'}</span>
      <div className="gate__building">
        <img className="gate__house" src={tinyPropUrl(building)} alt="" />
      </div>
      <div className="gate__body">
        <h2 className="gate__title">{title}</h2>
        <p className="gate__desc">
          {description.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        {/* <a> 안에 <button> 을 넣을 수 없으므로 링크 자체에 버튼 스타일을 입힌다 */}
        <Link to={to} className={`pxbtn pxbtn--${tone} pxbtn--lg pxbtn--full`}>
          입장하기 ›
        </Link>
      </div>
      <div className="gate__steps" aria-hidden />
    </div>
  )
}

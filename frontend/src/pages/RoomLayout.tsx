import { createContext, useContext, useState, type FormEvent } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { useChangeLogs, useRoom } from '@/api/queries'
import type { Room } from '@/api/types'
import { GameNav } from '@/components/GameNav'
import { PixelButton } from '@/components/PixelButton'
import { PixelLoader } from '@/components/PixelLoader'
import { PixelModal } from '@/components/PixelModal'
import { Scene } from '@/components/Scene'
import { useToast } from '@/components/Toast'
import { useBgm } from '@/components/Bgm'
import { NICKNAME_MAX_LENGTH, useNickname } from '@/lib/nickname'

interface RoomContextValue {
  room: Room
  nickname: string
  openSettings: () => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function useRoomCode(): string {
  const { code } = useParams<{ code: string }>()
  return (code ?? '').toUpperCase()
}

export function useRoomContext(): RoomContextValue {
  const value = useContext(RoomContext)
  if (!value) throw new Error('useRoomContext 는 RoomLayout 안에서만 사용할 수 있습니다.')
  return value
}

export function RoomLayout() {
  const code = useRoomCode()
  const room = useRoom(code)
  const [nickname, setNickname] = useNickname()
  const [editingNickname, setEditingNickname] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (room.isPending) {
    return (
      <Scene kind="dungeon">
        <div className="room">
          <PixelLoader label="ENTERING ROOM" />
        </div>
      </Scene>
    )
  }

  if (room.isError) {
    const notFound = room.error instanceof ApiError && room.error.status === 404
    return (
      <Scene kind="dungeon">
        <div className="room__error">
          <h1 className="font-pixel text-gold" style={{ fontSize: 22 }}>
            {notFound ? 'ROOM NOT FOUND' : 'CONNECTION LOST'}
          </h1>
          <p className="text-muted">
            {notFound
              ? `초대 코드 ${code} 에 해당하는 방이 없습니다.`
              : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {!notFound && (
              <PixelButton variant="gold" onClick={() => room.refetch()}>
                다시 시도
              </PixelButton>
            )}
            <Link to="/">
              <PixelButton variant="ghost">홈으로</PixelButton>
            </Link>
          </div>
        </div>
      </Scene>
    )
  }

  const contextValue: RoomContextValue = {
    room: room.data,
    nickname: nickname ?? '',
    openSettings: () => setSettingsOpen(true),
  }

  return (
    <RoomContext.Provider value={contextValue}>
      <div className="room">
        <GameNav code={code} onOpenSettings={() => setSettingsOpen(true)} />
        <Outlet />
      </div>

      <NicknameModal
        open={!nickname || editingNickname}
        locked={!nickname}
        initial={nickname ?? ''}
        onSubmit={(value) => {
          setNickname(value)
          setEditingNickname(false)
        }}
        onClose={() => setEditingNickname(false)}
      />

      <SettingsModal
        room={room.data}
        nickname={nickname ?? ''}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onEditNickname={() => {
          setSettingsOpen(false)
          setEditingNickname(true)
        }}
      />
    </RoomContext.Provider>
  )
}

interface NicknameModalProps {
  open: boolean
  locked: boolean
  initial: string
  onSubmit: (value: string) => void
  onClose: () => void
}

function NicknameModal({ open, locked, initial, onSubmit, onClose }: NicknameModalProps) {
  const [value, setValue] = useState(initial)
  const trimmed = value.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <PixelModal open={open} title="WHO ARE YOU?" locked={locked} onClose={onClose} width={420}>
      <form className="nick-form" onSubmit={submit}>
        <label className="px-label" htmlFor="nickname">
          사용할 닉네임을 입력해주세요.
        </label>
        <input
          id="nickname"
          className="px-input"
          autoFocus
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="예: 민준"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="nick-form__hint">
          로그인이 아니라 "누가 바꿨는지" 기록에 표시하기 위한 이름입니다. 이 브라우저에만 저장됩니다.
        </p>
        <PixelButton type="submit" variant="gold" pixelFont fullWidth disabled={!trimmed}>
          OK
        </PixelButton>
      </form>
    </PixelModal>
  )
}

interface SettingsModalProps {
  room: Room
  nickname: string
  open: boolean
  onClose: () => void
  onEditNickname: () => void
}

function SettingsModal({ room, nickname, open, onClose, onEditNickname }: SettingsModalProps) {
  const toast = useToast()
  const logs = useChangeLogs(room.inviteCode, open)

  const copyInvite = async () => {
    const url = window.location.origin
    try {
      await navigator.clipboard.writeText(url)
      toast.success('사이트 링크를 복사했습니다! 친구에게 보내주세요.')
    } catch {
      toast.info(url)
    }
  }

  return (
    <PixelModal open={open} title="SETTINGS" onClose={onClose} width={560}>
      <div className="settings">
        <div className="settings__row">
          <div>
            <span className="px-label">방</span>
            <strong>{room.name}</strong>
          </div>
          <PixelButton variant="blue" size="sm" onClick={copyInvite}>
            링크 복사
          </PixelButton>
        </div>

        <div className="settings__row">
          <div>
            <span className="px-label">내 닉네임</span>
            <strong>{nickname}</strong>
          </div>
          <PixelButton variant="ghost" size="sm" onClick={onEditNickname}>
            변경
          </PixelButton>
        </div>

        <BgmRow />

        <p className="settings__credit">
          Characters &amp; village: <a href="https://pixelfrog-assets.itch.io/tiny-swords" target="_blank" rel="noreferrer">Tiny Swords</a> by Pixel Frog
          {' · '}Music &amp; UI: <a href="https://pixel-boy.itch.io/ninja-adventure-asset-pack" target="_blank" rel="noreferrer">Ninja Adventure</a> (CC0)
          {' · '}Font: Galmuri (OFL)
        </p>

        <div>
          <p className="settings__section-title" style={{ marginBottom: 8 }}>
            최근 변경 기록
          </p>
          {logs.isPending && <PixelLoader inline label="LOADING" />}
          {logs.isError && <p className="px-error">기록을 불러오지 못했습니다.</p>}
          {logs.data && logs.data.length === 0 && <p className="text-muted">아직 변경 기록이 없습니다.</p>}
          {logs.data && logs.data.length > 0 && (
            <ul className="changelog">
              {logs.data.map((log) => (
                <li key={log.id} className="changelog__item">
                  <span>{log.message}</span>
                  <time className="changelog__time" dateTime={log.createdAt}>
                    {formatTime(log.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PixelModal>
  )
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 설정 모달의 배경음악 줄: 켜기/끄기 + 볼륨 */
function BgmRow() {
  const bgm = useBgm()
  if (!bgm) return null
  return (
    <div className="settings__row">
      <div className="settings__bgm">
        <span className="px-label">배경음악</span>
        {bgm.unsupported ? (
          <strong>이 브라우저는 재생을 지원하지 않아요</strong>
        ) : (
          <label className="settings__volume">
            <span className="visually-hidden">볼륨</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(bgm.volume * 100)}
              onChange={(event) => bgm.setVolume(Number(event.target.value) / 100)}
              disabled={!bgm.enabled}
              aria-valuetext={`${Math.round(bgm.volume * 100)}%`}
            />
            <span className="settings__volume-value font-pixel">{Math.round(bgm.volume * 100)}</span>
          </label>
        )}
        {bgm.nowPlaying && <small className="settings__now">♪ {bgm.nowPlaying}</small>}
      </div>
      {!bgm.unsupported && (
        <PixelButton variant={bgm.enabled ? 'blue' : 'ghost'} size="sm" onClick={bgm.toggle} aria-pressed={bgm.enabled}>
          {bgm.enabled ? '켜짐' : '꺼짐'}
        </PixelButton>
      )}
    </div>
  )
}

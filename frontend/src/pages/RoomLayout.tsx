import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { useChangeLogs, useRoom } from '@/api/queries'
import { PixelButton } from '@/components/PixelButton'
import { PixelLoader } from '@/components/PixelLoader'
import { PixelModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'
import { NICKNAME_MAX_LENGTH, useNickname } from '@/lib/nickname'

export function useRoomCode(): string {
  const { code } = useParams<{ code: string }>()
  return (code ?? '').toUpperCase()
}

export function RoomLayout() {
  const code = useRoomCode()
  const room = useRoom(code)
  const toast = useToast()
  const [nickname, setNickname] = useNickname()
  const [editingNickname, setEditingNickname] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)

  const copyInvite = async () => {
    const url = `${window.location.origin}/room/${code}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('초대 링크를 복사했습니다!')
    } catch {
      toast.info(`초대 코드: ${code}`)
    }
  }

  if (room.isPending) {
    return (
      <div className="room">
        <PixelLoader label="ENTERING ROOM" />
      </div>
    )
  }

  if (room.isError) {
    const notFound = room.error instanceof ApiError && room.error.status === 404
    return (
      <div className="room">
        <div className="room__error">
          <h1 className="font-pixel text-gold" style={{ fontSize: 22 }}>
            {notFound ? 'ROOM NOT FOUND' : 'CONNECTION LOST'}
          </h1>
          <p className="text-muted">
            {notFound ? `초대 코드 ${code} 에 해당하는 방이 없습니다.` : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'}
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
      </div>
    )
  }

  return (
    <div className="room">
      <header className="room__header">
        <Link to="/" className="room__brand" aria-label="LOL RANK 홈">
          <span className="room__brand-ball" aria-hidden />
          LOL RANK
        </Link>
        <div className="room__name">
          <span className="room__name-text" title={room.data.name}>
            {room.data.name}
          </span>
          <button type="button" className="room__code" onClick={copyInvite} title="초대 링크 복사">
            #{room.data.inviteCode} <span aria-hidden>⧉</span>
          </button>
        </div>
        <nav className="room__nav" aria-label="메인 메뉴">
          <NavLink to={`/room/${code}`} end className="room__tab">
            <span className="room__tab-icon" aria-hidden>
              ⚔
            </span>
            <span className="room__tab-label">TEAM MAKER</span>
          </NavLink>
          <NavLink to={`/room/${code}/hierarchy`} className="room__tab">
            <span className="room__tab-icon" aria-hidden>
              👑
            </span>
            <span className="room__tab-label">계급도</span>
          </NavLink>
          <NavLink to={`/room/${code}/characters`} className="room__tab">
            <span className="room__tab-icon" aria-hidden>
              🎽
            </span>
            <span className="room__tab-label">캐릭터 관리</span>
          </NavLink>
        </nav>
        <PixelButton variant="ghost" size="sm" onClick={() => setLogsOpen(true)} title="최근 변경 기록">
          📜
        </PixelButton>
        <button type="button" className="room__me" onClick={() => setEditingNickname(true)} title="닉네임 변경">
          <span aria-hidden>🙂</span>
          <span className="room__me-name">{nickname ?? '닉네임 설정'}</span>
        </button>
      </header>

      <main className="room__main">
        <Outlet />
      </main>

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

      <ChangeLogModal code={code} open={logsOpen} onClose={() => setLogsOpen(false)} />
    </div>
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

interface ChangeLogModalProps {
  code: string
  open: boolean
  onClose: () => void
}

function ChangeLogModal({ code, open, onClose }: ChangeLogModalProps) {
  const logs = useChangeLogs(code, open)
  return (
    <PixelModal open={open} title="CHANGE LOG" onClose={onClose} width={560}>
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
    </PixelModal>
  )
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

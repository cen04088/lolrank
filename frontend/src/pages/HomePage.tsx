import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roomsApi } from '@/api/endpoints'
import { errorMessage } from '@/api/client'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { Scene } from '@/components/Scene'
import { useToast } from '@/components/Toast'
import { PLAYER_ASSET_KEYS } from '@/lib/assets'

const INVITE_CODE_LENGTH = 6

export function HomePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [roomName, setRoomName] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)

  const createRoom = useMutation({
    mutationFn: (name: string) => roomsApi.create(name),
    onSuccess: (room) => {
      toast.success(`"${room.name}" 방이 만들어졌습니다!`)
      navigate(`/room/${room.inviteCode}`)
    },
    onError: (error) => toast.error(errorMessage(error, '방을 만들지 못했습니다.')),
  })

  const joinRoom = useMutation({
    mutationFn: (inviteCode: string) => roomsApi.get(inviteCode),
    onSuccess: (room) => navigate(`/room/${room.inviteCode}`),
    onError: (error) => setCodeError(errorMessage(error, '방을 찾을 수 없습니다.')),
  })

  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    const name = roomName.trim()
    if (!name) return
    createRoom.mutate(name)
  }

  const onJoin = (event: FormEvent) => {
    event.preventDefault()
    setCodeError(null)
    const normalized = code.trim().toUpperCase()
    if (normalized.length !== INVITE_CODE_LENGTH) {
      setCodeError(`초대 코드는 ${INVITE_CODE_LENGTH}자리입니다.`)
      return
    }
    joinRoom.mutate(normalized)
  }

  return (
    <Scene kind="village">
      <main className="landing">
        <div className="logo">
          <span className="logo__crown" aria-hidden>
            👑
          </span>
          <h1 className="logo__text">LOL RANK</h1>
          <p className="logo__sub">우리들의 내전, 더 특별하게</p>
        </div>

        <div className="landing__mascots" aria-hidden>
          {PLAYER_ASSET_KEYS.slice(0, 6).map((key) => (
            <PixelAvatar key={key} assetKey={key} size={52} />
          ))}
        </div>

        <section className="paper landing__panel">
          <form className="landing__form" onSubmit={onCreate}>
            <h2 className="landing__form-title landing__form-title--blue">
              <span aria-hidden>⚔</span> 새 방 만들기
            </h2>
            <div className="px-field">
              <label className="px-label" htmlFor="room-name">
                방 이름
              </label>
              <input
                id="room-name"
                className="px-input"
                placeholder="예: 금요일 밤 내전"
                maxLength={40}
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                autoComplete="off"
              />
            </div>
            <PixelButton type="submit" variant="blue" size="lg" fullWidth loading={createRoom.isPending}>
              입장하기 ›
            </PixelButton>
            <p className="landing__hint">방 링크를 친구들에게 공유하면 누구나 캐릭터를 만들고 팀을 편집할 수 있습니다.</p>
          </form>

          <form className="landing__form" onSubmit={onJoin}>
            <h2 className="landing__form-title landing__form-title--red">
              <span aria-hidden>👑</span> 초대 코드로 입장
            </h2>
            <div className="px-field">
              <label className="px-label" htmlFor="invite-code">
                초대 코드
              </label>
              <input
                id="invite-code"
                className="px-input font-pixel"
                placeholder="ABCD12"
                maxLength={INVITE_CODE_LENGTH}
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                autoComplete="off"
                style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}
              />
              {codeError && <p className="px-error">{codeError}</p>}
            </div>
            <PixelButton type="submit" variant="red" size="lg" fullWidth loading={joinRoom.isPending}>
              입장하기 ›
            </PixelButton>
            <p className="landing__hint">로그인 없음 · 방 링크만 있으면 OK</p>
          </form>
        </section>
      </main>
    </Scene>
  )
}

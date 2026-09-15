import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roomsApi } from '@/api/endpoints'
import { errorMessage } from '@/api/client'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PixelPanel } from '@/components/PixelPanel'
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
    <main className="home">
      <div className="home__hero">
        <div className="home__mascots" aria-hidden>
          {PLAYER_ASSET_KEYS.slice(0, 5).map((key) => (
            <PixelAvatar key={key} assetKey={key} size={56} />
          ))}
        </div>
        <h1 className="home__logo">
          LOL RANK
          <small>5 VS 5 TEAM MAKER</small>
        </h1>
        <p className="home__tagline">친구들과의 내전, 도트 캐릭터를 직접 끌어다 팀을 짜고 계급도를 세워보세요.</p>
      </div>

      <div className="home__grid">
        <PixelPanel title="NEW ROOM" tone="wood">
          <form className="home__card-form" onSubmit={onCreate}>
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
            <PixelButton type="submit" variant="gold" size="lg" pixelFont fullWidth loading={createRoom.isPending}>
              START
            </PixelButton>
            <p className="text-muted" style={{ fontSize: 13 }}>
              방 링크를 친구들에게 공유하면 누구나 캐릭터를 만들고 팀을 편집할 수 있습니다.
            </p>
          </form>
        </PixelPanel>

        <PixelPanel title="JOIN ROOM" tone="blue">
          <form className="home__card-form" onSubmit={onJoin}>
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
            <PixelButton type="submit" variant="blue" size="lg" pixelFont fullWidth loading={joinRoom.isPending}>
              ENTER
            </PixelButton>
          </form>
        </PixelPanel>
      </div>

      <p className="home__footer">로그인 없음 · 방 링크만 있으면 OK · 픽셀 에셋은 자유롭게 교체 가능</p>
    </main>
  )
}

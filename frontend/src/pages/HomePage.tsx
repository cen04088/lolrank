import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roomsApi } from '@/api/endpoints'
import { PixelButton } from '@/components/PixelButton'
import { PixelLoader } from '@/components/PixelLoader'
import { Scene } from '@/components/Scene'

/** 단일 방 모드: "/" 는 기본 방 로비로 바로 들어간다. */
export function HomePage() {
  const navigate = useNavigate()
  const room = useQuery({ queryKey: ['room', 'default'], queryFn: roomsApi.getDefault, retry: 2 })

  useEffect(() => {
    if (room.data) navigate(`/room/${room.data.inviteCode}`, { replace: true })
  }, [room.data, navigate])

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
        {room.isError ? (
          <div className="landing__error paper">
            <p className="font-pixel-ko">서버에 연결할 수 없습니다.</p>
            <p className="landing__hint">잠시 후 다시 시도해주세요.</p>
            <PixelButton variant="blue" onClick={() => room.refetch()}>
              다시 시도
            </PixelButton>
          </div>
        ) : (
          <PixelLoader label="ENTERING VILLAGE" />
        )}
      </main>
    </Scene>
  )
}

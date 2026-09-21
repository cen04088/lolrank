import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { teamBoardApi } from '@/api/endpoints'
import { useAiStatus } from '@/api/queries'
import type { Commentary } from '@/api/types'
import { PixelButton } from '@/components/PixelButton'
import { WalkingSprite } from '@/components/WalkingSprite'
import { NPC_ELDER_KEY } from '@/lib/assets'

interface CasterPanelProps {
  code: string
  /** 보드 배치의 지문. 바뀌면 이전 해설을 접는다 */
  boardKey: string
  /** 10자리가 모두 찼는지 */
  boardFull: boolean
}

const TYPE_INTERVAL_MS = 22

/**
 * 장로의 AI 캐스터 해설. 백엔드 /api/ai/status 가 꺼져 있으면(키 없음) 아무것도 그리지 않는다.
 * 해설은 사용자가 버튼을 눌렀을 때만 요청하고, 같은 배치는 서버 캐시에서 바로 돌아온다.
 */
export function CasterPanel({ code, boardKey, boardFull }: CasterPanelProps) {
  const status = useAiStatus()
  const [result, setResult] = useState<Commentary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const typed = useTypewriter(result?.text ?? '', result?.cached ? 0 : TYPE_INTERVAL_MS)

  const ask = useMutation({
    mutationFn: () => teamBoardApi.commentary(code),
    onSuccess: (data) => {
      setError(null)
      setResult(data)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : '해설을 가져오지 못했습니다.')
    },
  })

  // 보드가 바뀌면 지난 해설은 접는다 (다시 누르면 새 배치로 요청)
  useEffect(() => {
    setResult(null)
    setError(null)
  }, [boardKey])

  if (!status.data?.commentary) {
    return null
  }

  const disabled = !boardFull || ask.isPending
  const idle = !result && !ask.isPending && !error

  return (
    <section className="caster" aria-label="장로의 AI 해설">
      <div className="caster__npc" aria-hidden>
        <WalkingSprite assetKey={NPC_ELDER_KEY} direction="right" size={72} paused={!ask.isPending} className="caster__sprite" />
      </div>

      <div className="caster__body">
        <div className="caster__head">
          <span className="caster__label font-pixel">AI CASTER</span>
          <span className="caster__name font-pixel-ko">장로의 경기 전 해설</span>
          {result?.cached && <span className="caster__badge font-pixel">REPLAY</span>}
        </div>

        <div className={`caster__bubble bubble bubble--left font-pixel-ko ${idle ? 'caster__bubble--idle' : ''}`}>
          {ask.isPending && <span className="caster__thinking">장로가 양 팀을 살펴보는 중<Dots /></span>}
          {!ask.isPending && error && <span className="caster__error">{error}</span>}
          {!ask.isPending && !error && result && (
            <p className="caster__text" aria-live="polite">
              {typed}
              {typed.length < result.text.length && <span className="caster__cursor" aria-hidden>▌</span>}
            </p>
          )}
          {idle &&
            (boardFull
              ? '양 팀이 모두 정해졌군. 내가 한마디 해줄까?'
              : '10자리가 모두 채워지면 경기 전 해설을 들려주지.')}
        </div>

        <div className="caster__actions">
          <PixelButton
            variant="gold"
            size="sm"
            onClick={() => ask.mutate()}
            disabled={disabled}
            loading={ask.isPending}
            title={boardFull ? undefined : '10자리가 모두 채워져야 합니다.'}
          >
            {result ? '🎙 다시 듣기' : '🎙 장로의 해설 듣기'}
          </PixelButton>
        </div>
      </div>
    </section>
  )
}

/** 글자가 한 자씩 찍히는 효과. interval 이 0 이면 즉시 전체를 보여준다. */
function useTypewriter(text: string, intervalMs: number): string {
  const [shown, setShown] = useState('')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
    if (!text || intervalMs === 0) {
      setShown(text)
      return
    }
    setShown('')
    let index = 0
    timer.current = window.setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length && timer.current !== null) {
        window.clearInterval(timer.current)
        timer.current = null
      }
    }, intervalMs)
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current)
    }
  }, [text, intervalMs])

  return shown
}

function Dots() {
  const [n, setN] = useState(1)
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => (v % 3) + 1), 400)
    return () => window.clearInterval(id)
  }, [])
  return <span aria-hidden>{'.'.repeat(n)}</span>
}

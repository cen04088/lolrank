import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SceneKind } from '@/components/Scene'
import { BGM_TRACKS, canPlayOgg, useBgmSettings, type BgmSettings } from '@/lib/bgm'

interface BgmContextValue extends BgmSettings {
  /** 재생 중인 트랙 이름 (꺼져 있거나 아직 시작 전이면 null) */
  nowPlaying: string | null
  /** ogg 를 못 트는 브라우저 */
  unsupported: boolean
  toggle: () => void
  setVolume: (volume: number) => void
  /** Scene 이 자기 종류를 알려준다 */
  requestTrack: (kind: SceneKind | null) => void
}

const BgmContext = createContext<BgmContextValue | null>(null)

const FADE_MS = 600
const FADE_STEPS = 12

/**
 * 앱 전체 배경음악. 오디오 엘리먼트 하나로 화면 종류에 따라 곡을 바꾼다.
 * 브라우저 자동재생 정책 때문에 첫 클릭/키 입력 뒤부터 소리가 나고, 설정은 localStorage 에 남는다.
 */
export function BgmProvider({ children }: { children: ReactNode }) {
  const [settings, update] = useBgmSettings()
  const [kind, setKind] = useState<SceneKind | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimer = useRef<number | null>(null)
  const unsupported = useMemo(() => !canPlayOgg(), [])

  // 오디오 엘리먼트는 한 번만 만든다.
  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = settings.volume
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 자동재생 정책: 사용자의 첫 상호작용 이후에만 play() 가 허용된다.
  useEffect(() => {
    if (unlocked) return
    const unlock = () => setUnlocked(true)
    const options = { once: true, passive: true } as AddEventListenerOptions
    window.addEventListener('pointerdown', unlock, options)
    window.addEventListener('keydown', unlock, options)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [unlocked])

  const clearFade = () => {
    if (fadeTimer.current !== null) {
      window.clearInterval(fadeTimer.current)
      fadeTimer.current = null
    }
  }

  const fadeTo = useCallback((audio: HTMLAudioElement, target: number, onDone?: () => void) => {
    clearFade()
    const start = audio.volume
    let step = 0
    fadeTimer.current = window.setInterval(() => {
      step += 1
      const t = step / FADE_STEPS
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * t))
      if (step >= FADE_STEPS) {
        clearFade()
        onDone?.()
      }
    }, FADE_MS / FADE_STEPS)
  }, [])

  // 켜짐/화면/잠금 해제 상태가 바뀔 때 실제 재생을 맞춘다.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || unsupported) return

    const track = kind ? BGM_TRACKS[kind] : null
    const shouldPlay = settings.enabled && unlocked && track !== null

    if (!shouldPlay) {
      if (!audio.paused) {
        fadeTo(audio, 0, () => {
          audio.pause()
          audio.volume = settings.volume
        })
      }
      setNowPlaying(null)
      return
    }

    const nextSrc = new URL(track!.src, window.location.origin).href
    const switching = audio.src !== nextSrc

    const start = () => {
      if (switching) {
        audio.src = track!.src
        audio.load()
      }
      audio.volume = switching || audio.paused ? 0 : audio.volume
      audio
        .play()
        .then(() => {
          fadeTo(audio, settings.volume)
          setNowPlaying(track!.title)
        })
        .catch(() => {
          // 정책상 거부되면 다음 상호작용 때 다시 시도된다.
          setNowPlaying(null)
        })
    }

    if (switching && !audio.paused) {
      fadeTo(audio, 0, start)
    } else {
      start()
    }
  }, [kind, settings.enabled, unlocked, unsupported, fadeTo]) // eslint-disable-line react-hooks/exhaustive-deps

  // 볼륨 슬라이더는 즉시 반영 (페이드 중이 아닐 때만)
  useEffect(() => {
    const audio = audioRef.current
    if (audio && fadeTimer.current === null && !audio.paused) {
      audio.volume = settings.volume
    }
  }, [settings.volume])

  const value = useMemo<BgmContextValue>(
    () => ({
      ...settings,
      nowPlaying,
      unsupported,
      toggle: () => {
        update({ enabled: !settings.enabled })
        setUnlocked(true)
      },
      setVolume: (volume) => update({ volume }),
      requestTrack: setKind,
    }),
    [settings, nowPlaying, unsupported, update],
  )

  return <BgmContext.Provider value={value}>{children}</BgmContext.Provider>
}

export function useBgm(): BgmContextValue | null {
  return useContext(BgmContext)
}

/** Scene 안에서 호출: 이 화면이 보이는 동안 해당 종류의 곡을 튼다. */
export function useBgmTrack(kind: SceneKind) {
  const bgm = useBgm()
  const request = bgm?.requestTrack
  useEffect(() => {
    if (!request) return
    request(kind)
  }, [kind, request])
}

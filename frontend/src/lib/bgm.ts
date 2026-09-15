import { useCallback, useEffect, useState } from 'react'
import type { SceneKind } from '@/components/Scene'

/**
 * BGM 설정(켜짐/볼륨)은 닉네임처럼 localStorage 에 두고 탭 안에서는 이벤트로 동기화한다.
 * 트랙은 Ninja Adventure 팩(CC0) 의 ogg 3곡. 화면 종류(SceneKind)마다 다른 곡을 튼다.
 */
const STORAGE_KEY = 'lolrank.bgm'
const CHANGE_EVENT = 'lolrank:bgm-changed'

export const DEFAULT_BGM_VOLUME = 0.35

export interface BgmSettings {
  enabled: boolean
  /** 0 ~ 1 */
  volume: number
}

/** 기본은 꺼짐. 상단바 BGM 버튼으로 켠 사람만 듣는다. */
const DEFAULTS: BgmSettings = { enabled: false, volume: DEFAULT_BGM_VOLUME }

export const BGM_TRACKS: Record<SceneKind, { src: string; title: string }> = {
  village: { src: '/assets/audio/village.ogg', title: 'Calm Village' },
  dungeon: { src: '/assets/audio/dungeon.ogg', title: 'Dungeon' },
  castle: { src: '/assets/audio/castle.ogg', title: 'Dark Castle' },
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BGM_VOLUME
  return Math.min(1, Math.max(0, value))
}

export function getBgmSettings(): BgmSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<BgmSettings>
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULTS.enabled,
      volume: typeof parsed.volume === 'number' ? clampVolume(parsed.volume) : DEFAULTS.volume,
    }
  } catch {
    return DEFAULTS
  }
}

export function saveBgmSettings(next: Partial<BgmSettings>): BgmSettings {
  const merged: BgmSettings = { ...getBgmSettings(), ...next }
  merged.volume = clampVolume(merged.volume)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // 저장이 막혀도(사생활 보호 모드 등) 이번 세션 안에서는 동작해야 한다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return merged
}

export function useBgmSettings(): [BgmSettings, (next: Partial<BgmSettings>) => void] {
  const [settings, setSettings] = useState<BgmSettings>(() => getBgmSettings())

  useEffect(() => {
    const sync = () => setSettings(getBgmSettings())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const update = useCallback((next: Partial<BgmSettings>) => {
    setSettings(saveBgmSettings(next))
  }, [])

  return [settings, update]
}

/** 브라우저가 Ogg Vorbis 를 재생할 수 있는지 (Safari 구버전은 불가). */
export function canPlayOgg(): boolean {
  if (typeof document === 'undefined') return false
  try {
    return document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"') !== ''
  } catch {
    return false
  }
}

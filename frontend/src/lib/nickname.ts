import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'lolrank.nickname'
const CHANGE_EVENT = 'lolrank:nickname-changed'
export const NICKNAME_MAX_LENGTH = 20

export function getNickname(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value && value.trim() ? value.trim() : null
  } catch {
    return null
  }
}

export function setNickname(nickname: string): void {
  const trimmed = nickname.trim().slice(0, NICKNAME_MAX_LENGTH)
  try {
    if (trimmed) {
      window.localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // private mode 등에서 저장이 막혀도 앱은 동작해야 한다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useNickname(): [string | null, (value: string) => void] {
  const [nickname, setState] = useState<string | null>(() => getNickname())

  useEffect(() => {
    const sync = () => setState(getNickname())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const update = useCallback((value: string) => setNickname(value), [])
  return [nickname, update]
}

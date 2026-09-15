import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TOAST_DURATION_MS = 2800
const MAX_TOASTS = 4

const ICONS: Record<ToastKind, string> = {
  success: 'OK',
  error: '!!',
  info: '>>',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++
    setItems((prev) => [...prev, { id, kind, message }].slice(-MAX_TOASTS))
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pxtoast-stack" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`pxtoast pxtoast--${item.kind}`} role="status">
            <span className="pxtoast__icon" aria-hidden>
              {ICONS[item.kind]}
            </span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast 는 ToastProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}

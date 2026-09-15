import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PixelButton } from './PixelButton'

interface PixelModalProps {
  open: boolean
  title: ReactNode
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
  /** true 면 배경 클릭/ESC 로 닫을 수 없다 (닉네임 입력 등) */
  locked?: boolean
}

export function PixelModal({ open, title, onClose, children, footer, width, locked = false }: PixelModalProps) {
  useEffect(() => {
    if (!open || locked || !onClose) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, locked, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const style = width ? ({ '--modal-w': `${width}px` } as CSSProperties) : undefined

  return createPortal(
    <div
      className="pxmodal-backdrop"
      onMouseDown={(event) => {
        if (!locked && onClose && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pxmodal" role="dialog" aria-modal="true" style={style}>
        <header className="pxmodal__header">
          <h2 className="pxmodal__title">{title}</h2>
          {!locked && onClose && (
            <button type="button" className="pxmodal__close" onClick={onClose} aria-label="닫기">
              ✕
            </button>
          )}
        </header>
        <div className="pxmodal__body">{children}</div>
        {footer && <footer className="pxmodal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmModalProps {
  open: boolean
  title: ReactNode
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <PixelModal
      open={open}
      title={title}
      onClose={onCancel}
      width={440}
      footer={
        <>
          <PixelButton variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </PixelButton>
          <PixelButton variant={danger ? 'red' : 'gold'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </PixelButton>
        </>
      }
    >
      <p className="pxmodal__message">{message}</p>
    </PixelModal>
  )
}

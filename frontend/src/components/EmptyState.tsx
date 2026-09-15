import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  message: string
  hint?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon = '🏟', message, hint, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`pxempty ${className}`.trim()}>
      <div className="pxempty__icon" aria-hidden>
        {icon}
      </div>
      <p className="pxempty__message">{message}</p>
      {hint && <p className="pxempty__hint">{hint}</p>}
      {action}
    </div>
  )
}

import type { Position } from '@/api/types'
import { POSITION_ICONS, POSITION_SHORT } from '@/lib/labels'

interface PositionTagProps {
  position: Position
  kind?: 'main' | 'sub' | 'plain'
  showIcon?: boolean
}

export function PositionTag({ position, kind = 'plain', showIcon = false }: PositionTagProps) {
  const className = kind === 'plain' ? 'pxpos' : `pxpos pxpos--${kind}`
  return (
    <span className={className} title={position}>
      {showIcon && <span aria-hidden>{POSITION_ICONS[position]}</span>}
      {POSITION_SHORT[position]}
    </span>
  )
}

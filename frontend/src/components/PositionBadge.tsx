import type { Position } from '@/api/types'
import { POSITION_SHORT } from '@/lib/labels'

interface PositionBadgeProps {
  position: Position
  ghost?: boolean
  className?: string
}

/** 초안의 색상 포지션 배지 (TOP 금색 / JUG 녹색 / MID 보라 / ADC 주황 / SUP 청록). */
export function PositionBadge({ position, ghost = false, className = '' }: PositionBadgeProps) {
  const classes = ['posbadge', `posbadge--${position.toLowerCase()}`, ghost && 'posbadge--ghost', className]
    .filter(Boolean)
    .join(' ')
  return <span className={classes}>{POSITION_SHORT[position]}</span>
}

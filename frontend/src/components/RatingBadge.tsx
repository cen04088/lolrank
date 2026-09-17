import type { Rating } from '@/api/types'

interface RatingBadgeProps {
  rating: Rating | undefined
  /** compact: 카드용 한 줄, full: 상세 카드용 */
  variant?: 'compact' | 'full'
}

/** 경기 기록 보정치 표시. 승패 기록이 없으면 아무것도 그리지 않는다. */
export function RatingBadge({ rating, variant = 'compact' }: RatingBadgeProps) {
  if (!rating || rating.played === 0) return null
  const sign = rating.delta > 0 ? '+' : ''
  const tone = rating.delta > 0 ? 'up' : rating.delta < 0 ? 'down' : 'flat'
  const arrow = rating.delta > 0 ? '▲' : rating.delta < 0 ? '▼' : '■'
  const record = `${rating.played}전 ${rating.wins}승 ${rating.losses}패`
  return (
    <span className={`rbadge rbadge--${tone} rbadge--${variant} font-pixel`} title={`기록 보정 ${sign}${rating.delta} · ${record}`}>
      <span className="rbadge__delta">
        {arrow} {sign}
        {rating.delta}
      </span>
      <span className="rbadge__record">{record}</span>
    </span>
  )
}

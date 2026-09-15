import type { CSSProperties } from 'react'
import type { Tier } from '@/api/types'
import { TIER_COLORS, tierLabel } from '@/lib/labels'

interface TierBadgeProps {
  tier: Tier
  division: number | null
  size?: 'sm' | 'lg'
}

export function TierBadge({ tier, division, size = 'sm' }: TierBadgeProps) {
  const style = { '--tier-color': TIER_COLORS[tier] } as CSSProperties
  return (
    <span className={size === 'lg' ? 'pxtier pxtier--lg' : 'pxtier'} style={style}>
      {tierLabel(tier, division)}
    </span>
  )
}

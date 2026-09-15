import type { CSSProperties } from 'react'
import { walkSheetUrl } from '@/lib/assets'
import './walking-sprite.css'

type Direction = 'down' | 'up' | 'left' | 'right'

const ROW: Record<Direction, number> = { down: 0, up: 1, left: 2, right: 3 }
const FRAME = 16
const FRAMES = 4

interface WalkingSpriteProps {
  assetKey: string
  direction?: Direction
  /** 한 프레임(16px)을 몇 배로 키울지 */
  scale?: number
  /** 애니메이션 정지 (정면 1프레임) */
  paused?: boolean
  className?: string
}

/** 걷기 스프라이트시트(64x64)를 CSS steps 애니메이션으로 재생한다. */
export function WalkingSprite({ assetKey, direction = 'right', scale = 3, paused = false, className = '' }: WalkingSpriteProps) {
  const size = FRAME * scale
  const style = {
    '--ws-size': `${size}px`,
    '--ws-sheet-w': `${FRAME * FRAMES * scale}px`,
    '--ws-row': `-${ROW[direction] * size}px`,
    backgroundImage: `url(${walkSheetUrl(assetKey)})`,
  } as CSSProperties
  return (
    <span
      className={`wsprite ${paused ? 'wsprite--paused' : ''} ${className}`.trim()}
      style={style}
      role="img"
      aria-hidden
    />
  )
}

import type { CSSProperties } from 'react'
import { isHiResSprite, spriteFrameSize, walkSheetUrl } from '@/lib/assets'
import './walking-sprite.css'

type Direction = 'down' | 'up' | 'left' | 'right'

const ROW: Record<Direction, number> = { down: 0, up: 1, left: 2, right: 3 }
const FRAMES = 4

interface WalkingSpriteProps {
  assetKey: string
  direction?: Direction
  /** 화면에 표시할 한 변 픽셀 */
  size?: number
  /** 애니메이션 정지 (1프레임) */
  paused?: boolean
  className?: string
}

/** 걷기 스프라이트시트(4방향 × 4프레임)를 CSS steps 애니메이션으로 재생한다. */
export function WalkingSprite({ assetKey, direction = 'right', size = 48, paused = false, className = '' }: WalkingSpriteProps) {
  const style = {
    '--ws-size': `${size}px`,
    '--ws-sheet-w': `${size * FRAMES}px`,
    '--ws-row': `-${ROW[direction] * size}px`,
    backgroundImage: `url(${walkSheetUrl(assetKey)})`,
  } as CSSProperties
  const classes = [
    'wsprite',
    paused && 'wsprite--paused',
    isHiResSprite(assetKey) && size < spriteFrameSize(assetKey) && 'wsprite--smooth',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <span className={classes} style={style} role="img" aria-hidden />
}

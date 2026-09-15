import { useState, type CSSProperties } from 'react'
import { assetUrl } from '@/lib/assets'

interface PixelAvatarProps {
  assetKey: string
  size?: number
  alt?: string
  className?: string
}

/**
 * /public/assets/players/{assetKey}.png 를 표시한다.
 * 파일이 없으면 assetKey 로부터 결정론적으로 생성한 8x8 픽셀 아바타를 대신 그린다.
 */
export function PixelAvatar({ assetKey, size = 48, alt = '', className = '' }: PixelAvatarProps) {
  const [failed, setFailed] = useState(false)
  const style = { '--avatar-size': `${size}px` } as CSSProperties

  return (
    <span className={`pxavatar ${className}`.trim()} style={style}>
      {failed ? (
        <FallbackSprite seed={assetKey} />
      ) : (
        <img
          src={assetUrl(assetKey)}
          alt={alt}
          width={size}
          height={size}
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

const PALETTE = ['#4298ff', '#ff5868', '#f5c451', '#3ecf6f', '#b38cff', '#4fd1c5', '#ff9f43', '#f472b6']

function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 좌우 대칭 8x8 스프라이트. 같은 seed 는 항상 같은 그림. */
function FallbackSprite({ seed }: { seed: string }) {
  const h = hash(seed)
  const color = PALETTE[h % PALETTE.length]
  const skin = '#f1c27d'
  const cells: { x: number; y: number; fill: string }[] = []
  let bits = h
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 4; x++) {
      bits = (bits * 1103515245 + 12345) >>> 0
      const on = ((bits >>> 16) & 3) !== 0
      if (!on) continue
      const fill = y < 3 ? skin : color
      cells.push({ x, y, fill })
      cells.push({ x: 7 - x, y, fill })
    }
  }
  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden>
      {cells.map((cell, index) => (
        <rect key={index} x={cell.x} y={cell.y} width={1} height={1} fill={cell.fill} />
      ))}
    </svg>
  )
}

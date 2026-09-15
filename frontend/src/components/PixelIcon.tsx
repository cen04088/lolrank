import { uiUrl } from '@/lib/assets'

interface PixelIconProps {
  name: string
  size?: number
  className?: string
  title?: string
}

/** Ninja Adventure UI 아이콘 (검, 트로피, 이모트 등) */
export function PixelIcon({ name, size = 24, className = '', title }: PixelIconProps) {
  return (
    <img
      className={`pxicon ${className}`.trim()}
      src={uiUrl(name)}
      width={size}
      height={size}
      alt={title ?? ''}
      title={title}
      draggable={false}
    />
  )
}

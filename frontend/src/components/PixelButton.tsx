import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'gold' | 'blue' | 'red' | 'grass' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  pixelFont?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  loading?: boolean
}

export function PixelButton({
  variant = 'default',
  size = 'md',
  pixelFont = false,
  fullWidth = false,
  icon,
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: PixelButtonProps) {
  const classes = [
    'pxbtn',
    variant !== 'default' && `pxbtn--${variant}`,
    size !== 'md' && `pxbtn--${size}`,
    pixelFont && 'pxbtn--pixel',
    fullWidth && 'pxbtn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading ? (
        <span className="pxbtn__icon" aria-hidden>
          ▮▮▮
        </span>
      ) : (
        icon && (
          <span className="pxbtn__icon" aria-hidden>
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  )
}

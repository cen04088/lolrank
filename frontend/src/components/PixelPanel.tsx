import type { HTMLAttributes, ReactNode } from 'react'

type Tone = 'default' | 'blue' | 'red' | 'wood' | 'grass'

interface PixelPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  actions?: ReactNode
  tone?: Tone
  flush?: boolean
  children: ReactNode
}

export function PixelPanel({
  title,
  actions,
  tone = 'default',
  flush = false,
  className = '',
  children,
  ...rest
}: PixelPanelProps) {
  const classes = ['pxpanel', tone !== 'default' && `pxpanel--${tone}`, className].filter(Boolean).join(' ')
  return (
    <section className={classes} {...rest}>
      {(title || actions) && (
        <header className="pxpanel__header">
          <h2 className="pxpanel__title">{title}</h2>
          {actions && <div className="pxpanel__actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'pxpanel__body pxpanel__body--flush' : 'pxpanel__body'}>{children}</div>
    </section>
  )
}

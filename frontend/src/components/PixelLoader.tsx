interface PixelLoaderProps {
  label?: string
  inline?: boolean
}

export function PixelLoader({ label = 'LOADING', inline = false }: PixelLoaderProps) {
  return (
    <div className={inline ? 'pxloader pxloader--inline' : 'pxloader'} role="status" aria-live="polite">
      <div className="pxloader__dots" aria-hidden>
        <span className="pxloader__dot" />
        <span className="pxloader__dot" />
        <span className="pxloader__dot" />
        <span className="pxloader__dot" />
      </div>
      <span>{label}</span>
    </div>
  )
}

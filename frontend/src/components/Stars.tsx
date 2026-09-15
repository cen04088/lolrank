interface StarsProps {
  value: number
  max?: number
}

export function Stars({ value, max = 5 }: StarsProps) {
  const filled = Math.max(0, Math.min(max, value))
  return (
    <span className="pxstars" aria-label={`${filled} / ${max}`}>
      {'★'.repeat(filled)}
      <span className="pxstars__dim">{'★'.repeat(max - filled)}</span>
    </span>
  )
}

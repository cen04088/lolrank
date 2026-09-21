interface TitleTagProps {
  title: string | null | undefined
  size?: 'sm' | 'md'
  className?: string
}

/** 이름 옆에 붙는 칭호 리본. 칭호가 없으면 아무것도 그리지 않는다. */
export function TitleTag({ title, size = 'md', className = '' }: TitleTagProps) {
  if (!title) return null
  return (
    <span className={`ttag ttag--${size} font-pixel-ko ${className}`.trim()} title={`칭호: ${title}`}>
      {title}
    </span>
  )
}

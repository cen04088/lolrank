import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DonateBanner } from './DonateBanner'

describe('DonateBanner', () => {
  it('링크가 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<DonateBanner url="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('링크가 있으면 새 탭으로 여는 후원 링크를 보여준다', () => {
    render(<DonateBanner url="https://qr.kakaopay.com/abc123" />)
    const link = screen.getByRole('link', { name: /카카오페이로 후원하기/ })
    expect(link).toHaveAttribute('href', 'https://qr.kakaopay.com/abc123')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })
})

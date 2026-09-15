import { PixelIcon } from '@/components/PixelIcon'

/** 빌드 시 주입되는 카카오페이 송금 링크. 비어 있으면 배너를 렌더링하지 않는다. */
export const KAKAOPAY_URL: string = (import.meta.env.VITE_KAKAOPAY_URL ?? '').trim()

interface DonateBannerProps {
  url?: string
}

/**
 * 로비 하단 후원 배너. 카카오페이 앱 → 송금 → "송금 코드 링크" 로 만든 URL 을
 * VITE_KAKAOPAY_URL 에 넣으면 나타난다. 결제는 카카오페이 페이지에서만 이뤄지고
 * 이 앱은 링크를 새 탭으로 여는 것 외에 아무 것도 하지 않는다.
 */
export function DonateBanner({ url = KAKAOPAY_URL }: DonateBannerProps) {
  if (!url) {
    return null
  }
  return (
    <aside className="donate" aria-label="후원">
      <a className="donate__link" href={url} target="_blank" rel="noreferrer noopener">
        <PixelIcon name="emote_love" size={28} />
        <span className="donate__text">
          <strong className="font-pixel-ko">개발자에게 커피 한 잔 ☕</strong>
          <span className="donate__sub">카카오페이로 후원하기 →</span>
        </span>
        <span className="donate__badge font-pixel">KAKAO PAY</span>
      </a>
      <p className="donate__note">서버 유지비에 쓰여요. 후원은 전부 자유입니다!</p>
    </aside>
  )
}

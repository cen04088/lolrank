import { PixelButton } from '@/components/PixelButton'
import { PixelModal } from '@/components/PixelModal'

/** 선택: 카카오페이 송금 링크가 있으면 QR 아래에 "앱에서 열기" 버튼도 보여준다. */
export const KAKAOPAY_URL: string = (import.meta.env.VITE_KAKAOPAY_URL ?? '').trim()

export const SUPPORT_QR_SRC = '/assets/support/kakaopay_qr.png'

interface SupportModalProps {
  open: boolean
  onClose: () => void
}

/**
 * 후원 안내. 카카오페이 QR 이미지를 보여주기만 하고, 결제는 카카오페이 앱에서 이뤄진다.
 * 이 앱은 금액이나 계정 정보를 다루지 않는다.
 */
export function SupportModal({ open, onClose }: SupportModalProps) {
  return (
    <PixelModal
      open={open}
      title="SUPPORT"
      onClose={onClose}
      width={440}
      tone="paper"
      footer={
        <PixelButton variant="gold" onClick={onClose}>
          닫기
        </PixelButton>
      }
    >
      <div className="support">
        <p className="support__title font-pixel-ko">AI 토큰값과 서버비 후원하기</p>
        <img className="support__qr" src={SUPPORT_QR_SRC} alt="카카오페이 후원 QR 코드" width={270} height={325} />
        {KAKAOPAY_URL && (
          <a className="support__link" href={KAKAOPAY_URL} target="_blank" rel="noreferrer noopener">
            카카오페이 앱에서 바로 열기 →
          </a>
        )}
        <p className="support__thanks">후원해 주신 분들 덕분에 내전이 계속됩니다. 감사합니다 🙏</p>
      </div>
    </PixelModal>
  )
}

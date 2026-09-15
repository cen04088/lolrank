import type { Balance } from '@/api/types'
import { PixelButton } from '@/components/PixelButton'
import { Stars } from '@/components/Stars'
import { GRADE_STARS } from '@/lib/labels'

interface BalanceBarProps {
  balance: Balance
  boardEmpty: boolean
  syncing: boolean
  autoFilling: boolean
  autoFillDisabled: boolean
  resetDisabled: boolean
  onAutoFill: () => void
  onReset: () => void
}

export function BalanceBar({
  balance,
  boardEmpty,
  syncing,
  autoFilling,
  autoFillDisabled,
  resetDisabled,
  onAutoFill,
  onReset,
}: BalanceBarProps) {
  const total = balance.blueScore + balance.redScore
  const bluePercent = total === 0 ? 50 : Math.round((balance.blueScore / total) * 100)
  const gradeClass = `tm-balance__msg--${balance.grade.toLowerCase()}`

  return (
    <section className="tm-balance pixel-box" aria-label="팀 밸런스">
      <div className="tm-balance__grid">
        <TeamSummary team="BLUE" tier={balance.blueAverageTier} count={balance.blueCount} />

        <div className="tm-balance__center">
          <div className="tm-balance__title font-pixel">
            ⚖ TEAM BALANCE {syncing && <span className="tm-balance__sync">SYNC</span>}
          </div>
          <div className="tm-gauge" role="img" aria-label={`BLUE ${bluePercent}% / RED ${100 - bluePercent}%`}>
            <div className="tm-gauge__blue" style={{ width: `${bluePercent}%` }} />
            <div className="tm-gauge__red" style={{ width: `${100 - bluePercent}%` }} />
            <div className="tm-gauge__center" />
          </div>
          {boardEmpty ? (
            <p className="tm-balance__msg tm-balance__msg--idle">캐릭터를 배치하면 밸런스가 계산됩니다.</p>
          ) : (
            <>
              <Stars value={GRADE_STARS[balance.grade]} />
              <p className={`tm-balance__msg ${gradeClass}`}>{balance.message}</p>
            </>
          )}
        </div>

        <TeamSummary team="RED" tier={balance.redAverageTier} count={balance.redCount} />
      </div>

      <div className="tm-balance__actions">
        <PixelButton
          variant="gold"
          size="lg"
          icon="✨"
          onClick={onAutoFill}
          loading={autoFilling}
          disabled={autoFillDisabled}
          title={autoFillDisabled ? '대기석에 캐릭터가 있고 빈 슬롯이 있을 때 사용할 수 있습니다.' : undefined}
        >
          남은 자리 균형 맞춰 채우기
        </PixelButton>
        <PixelButton variant="ghost" size="lg" onClick={onReset} disabled={resetDisabled}>
          전체 초기화
        </PixelButton>
      </div>
    </section>
  )
}

interface TeamSummaryProps {
  team: 'BLUE' | 'RED'
  tier: string | null
  count: number
}

function TeamSummary({ team, tier, count }: TeamSummaryProps) {
  return (
    <div className={`tm-balance__team tm-balance__team--${team.toLowerCase()}`}>
      <span className="tm-balance__team-name font-pixel">{team}</span>
      <span className="tm-balance__team-label">평균 티어</span>
      <span className="tm-balance__team-tier font-pixel">{tier ?? '—'}</span>
      <span className="tm-balance__team-count">{count}/5 배치</span>
    </div>
  )
}

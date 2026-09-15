import type { Balance, HierarchyRank } from '@/api/types'
import { Stars } from '@/components/Stars'
import { PixelIcon } from '@/components/PixelIcon'
import { GRADE_EMOTES, GRADE_STARS } from '@/lib/labels'

interface PowerBarProps {
  balance: Balance
  boardEmpty: boolean
  syncing: boolean
}

/** 초안의 TEAM POWER 78 ——— 80 바. power = 팀 평균 전투력(0~100) = 계급도 등급 80% + 티어 20%. */
export function PowerBar({ balance, boardEmpty, syncing }: PowerBarProps) {
  const total = balance.bluePower + balance.redPower
  const bluePercent = total === 0 ? 50 : Math.round((balance.bluePower / total) * 100)
  const gradeClass = `power__msg--${balance.grade.toLowerCase()}`

  return (
    <section className="power" aria-label="팀 밸런스">
      <PowerSide
        team="BLUE"
        power={balance.bluePower}
        rank={balance.blueAverageRank}
        tier={balance.blueAverageTier}
        count={balance.blueCount}
      />

      <div className="power__center">
        <div className="power__bar" role="img" aria-label={`BLUE ${bluePercent}% / RED ${100 - bluePercent}%`}>
          <div className="power__bar-blue" style={{ width: `${bluePercent}%` }} />
          <div className="power__bar-red" style={{ width: `${100 - bluePercent}%` }} />
          <div className="power__bar-center" />
        </div>
        {boardEmpty ? (
          <p className="power__msg power__msg--idle">캐릭터를 배치하면 밸런스가 계산됩니다.</p>
        ) : (
          <div className="power__grade">
            <Stars value={GRADE_STARS[balance.grade]} />
            <p className={`power__msg ${gradeClass} font-pixel-ko`}>
              <PixelIcon name={GRADE_EMOTES[balance.grade]} size={28} /> {balance.message}
            </p>
          </div>
        )}
        {syncing && <span className="power__sync font-pixel">SYNC</span>}
      </div>

      <PowerSide
        team="RED"
        power={balance.redPower}
        rank={balance.redAverageRank}
        tier={balance.redAverageTier}
        count={balance.redCount}
      />
    </section>
  )
}

interface PowerSideProps {
  team: 'BLUE' | 'RED'
  power: number
  rank: HierarchyRank | null
  tier: string | null
  count: number
}

function PowerSide({ team, power, rank, tier, count }: PowerSideProps) {
  return (
    <div className={`power__side power__side--${team.toLowerCase()}`}>
      <span className="power__label font-pixel">TEAM POWER</span>
      <span className="power__value font-pixel">{count === 0 ? '--' : power}</span>
      <span className="power__tier">
        {rank && tier ? `평균 ${rank}등급 · ${tier}` : '배치 없음'} · {count}/5
      </span>
    </div>
  )
}

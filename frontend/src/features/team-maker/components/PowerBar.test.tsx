import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Balance } from '@/api/types'
import { PowerBar } from './PowerBar'

const balance: Balance = {
  blueScore: 224,
  redScore: 226,
  difference: 2,
  grade: 'PERFECT',
  message: '완벽에 가까운 밸런스!',
  blueCount: 5,
  redCount: 5,
  blueAverageTier: 'Gold II',
  redAverageTier: 'Gold II',
  blueAverageRank: 'A',
  redAverageRank: 'A',
  bluePower: 57,
  redPower: 57,
}

describe('PowerBar', () => {
  it('양팀 TEAM POWER 와 등급 문구, 별을 보여준다', () => {
    render(<PowerBar balance={balance} boardEmpty={false} syncing={false} />)
    expect(screen.getAllByText('57')).toHaveLength(2)
    expect(screen.getByText('완벽에 가까운 밸런스!')).toBeInTheDocument()
    expect(screen.getByLabelText('5 / 5')).toBeInTheDocument()
    expect(screen.getAllByText(/평균 A등급 · Gold II/)).toHaveLength(2)
  })

  it('보드가 비어 있으면 안내 문구만 보여준다', () => {
    render(
      <PowerBar
        balance={{ ...balance, blueCount: 0, redCount: 0, bluePower: 0, redPower: 0 }}
        boardEmpty
        syncing={false}
      />,
    )
    expect(screen.getByText('캐릭터를 배치하면 밸런스가 계산됩니다.')).toBeInTheDocument()
    expect(screen.queryByText('완벽에 가까운 밸런스!')).not.toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(2)
  })

  it('파워 비율대로 게이지 너비를 계산한다', () => {
    render(<PowerBar balance={{ ...balance, bluePower: 60, redPower: 20 }} boardEmpty={false} syncing={false} />)
    expect(screen.getByRole('img', { name: 'BLUE 75% / RED 25%' })).toBeInTheDocument()
  })
})

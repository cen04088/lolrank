import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Balance } from '@/api/types'
import { BalanceBar } from './BalanceBar'

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
}

function renderBar(overrides: Partial<Parameters<typeof BalanceBar>[0]> = {}) {
  const onAutoFill = vi.fn()
  const onReset = vi.fn()
  render(
    <BalanceBar
      balance={balance}
      boardEmpty={false}
      syncing={false}
      autoFilling={false}
      autoFillDisabled={false}
      resetDisabled={false}
      onAutoFill={onAutoFill}
      onReset={onReset}
      {...overrides}
    />,
  )
  return { onAutoFill, onReset }
}

describe('BalanceBar', () => {
  it('등급 문구와 별, 양팀 평균 티어를 보여준다', () => {
    renderBar()
    expect(screen.getByText('완벽에 가까운 밸런스!')).toBeInTheDocument()
    expect(screen.getByLabelText('5 / 5')).toBeInTheDocument()
    expect(screen.getAllByText('Gold II')).toHaveLength(2)
  })

  it('보드가 비어 있으면 안내 문구만 보여준다', () => {
    renderBar({ boardEmpty: true })
    expect(screen.getByText('캐릭터를 배치하면 밸런스가 계산됩니다.')).toBeInTheDocument()
    expect(screen.queryByText('완벽에 가까운 밸런스!')).not.toBeInTheDocument()
  })

  it('버튼이 콜백을 호출하고 disabled 를 존중한다', () => {
    const { onAutoFill, onReset } = renderBar({ resetDisabled: true })
    fireEvent.click(screen.getByRole('button', { name: /남은 자리 균형 맞춰 채우기/ }))
    expect(onAutoFill).toHaveBeenCalledTimes(1)

    const reset = screen.getByRole('button', { name: '전체 초기화' })
    expect(reset).toBeDisabled()
    fireEvent.click(reset)
    expect(onReset).not.toHaveBeenCalled()
  })

  it('점수 비율대로 게이지 너비를 계산한다', () => {
    renderBar({ balance: { ...balance, blueScore: 300, redScore: 100 } })
    const gauge = screen.getByRole('img', { name: 'BLUE 75% / RED 25%' })
    expect(gauge).toBeInTheDocument()
  })
})

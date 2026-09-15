import { DndContext } from '@dnd-kit/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pitch } from './Pitch'

function renderPitch(participantCount: number, totalCharacters: number, onOpenPicker = vi.fn()) {
  render(
    <DndContext>
      <Pitch
        bench={[]}
        participantCount={participantCount}
        totalCharacters={totalCharacters}
        dragging={false}
        onOpenPicker={onOpenPicker}
      />
    </DndContext>,
  )
  return onOpenPicker
}

describe('Pitch', () => {
  it('10명 미만이면 현재 인원 기준 완료 문구와 추가 선택 버튼을 보여준다', () => {
    const onOpenPicker = renderPitch(2, 12)

    expect(screen.getByText('2명 배치 완료')).toBeInTheDocument()
    expect(screen.queryByText('ALL SET!')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '참가자 더 선택' }))
    expect(onOpenPicker).toHaveBeenCalledOnce()
  })

  it('10명을 모두 배치하면 추가 선택 버튼을 숨긴다', () => {
    renderPitch(10, 12)

    expect(screen.getByText('배치 완료')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '참가자 더 선택' })).not.toBeInTheDocument()
  })
})

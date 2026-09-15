import { useEffect, useState } from 'react'
import type { Character } from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PixelModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'
import { positionSummary } from '@/lib/labels'

const MAX_PARTICIPANTS = 10

interface ParticipantPickerProps {
  open: boolean
  characters: Character[]
  selectedIds: number[]
  saving: boolean
  onClose: () => void
  onSave: (ids: number[]) => void
}

export function ParticipantPicker({ open, characters, selectedIds, saving, onClose, onSave }: ParticipantPickerProps) {
  const toast = useToast()
  const [selected, setSelected] = useState<Set<number>>(() => new Set(selectedIds))

  useEffect(() => {
    if (open) setSelected(new Set(selectedIds))
  }, [open, selectedIds])

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size >= MAX_PARTICIPANTS) {
        toast.error(`이미 ${MAX_PARTICIPANTS}명의 참가자가 선택되어 있습니다.`)
        return prev
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <PixelModal
      open={open}
      title={
        <>
          TODAY&apos;S PLAYERS{' '}
          <span className={selected.size >= MAX_PARTICIPANTS ? 'text-gold' : 'text-muted'}>
            {selected.size}/{MAX_PARTICIPANTS}
          </span>
        </>
      }
      onClose={onClose}
      width={560}
      footer={
        <>
          <PixelButton variant="ghost" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
            전체 해제
          </PixelButton>
          <PixelButton variant="ghost" onClick={onClose}>
            취소
          </PixelButton>
          <PixelButton variant="gold" onClick={() => onSave([...selected])} loading={saving}>
            저장
          </PixelButton>
        </>
      }
    >
      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        전체 캐릭터 {characters.length}명 중 오늘 내전에 참가하는 멤버를 최대 {MAX_PARTICIPANTS}명 선택하세요.
      </p>
      <ul className="tm-picker">
        {characters.map((character) => {
          const checked = selected.has(character.id)
          return (
            <li key={character.id}>
              <label className={checked ? 'tm-picker__row tm-picker__row--on' : 'tm-picker__row'}>
                <input type="checkbox" className="visually-hidden" checked={checked} onChange={() => toggle(character.id)} />
                <span className="tm-picker__check font-pixel" aria-hidden>
                  {checked ? '✓' : ''}
                </span>
                <PixelAvatar assetKey={character.assetKey} size={36} />
                <span className="tm-picker__name">{character.name}</span>
                <span className="tm-picker__meta font-pixel">{character.tierLabel}</span>
                <span className="tm-picker__meta">{positionSummary(character)}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </PixelModal>
  )
}

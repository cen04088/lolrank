import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { charactersApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queries'
import {
  DIVISIONS,
  POSITIONS,
  TIERS,
  type Character,
  type CreateCharacterRequest,
  type Position,
  type Tier,
  type UpdateCharacterRequest,
} from '@/api/types'
import { PixelAvatar } from '@/components/PixelAvatar'
import { PixelButton } from '@/components/PixelButton'
import { PixelModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'
import { PLAYER_ASSET_KEYS } from '@/lib/assets'
import { POSITION_ICONS, POSITION_LABELS, TIER_NAMES, tierHasDivision, tierLabel } from '@/lib/labels'

const NAME_MAX = 20
const DESCRIPTION_MAX = 100
const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

interface FormValues {
  name: string
  description: string
  assetKey: string
  tier: Tier
  division: number
  mainPosition: Position
  subPosition: Position | null
}

const DEFAULT_VALUES: FormValues = {
  name: '',
  description: '',
  assetKey: PLAYER_ASSET_KEYS[0],
  tier: 'GOLD',
  division: 4,
  mainPosition: 'MID',
  subPosition: null,
}

function fromCharacter(character: Character): FormValues {
  return {
    name: character.name,
    description: character.description ?? '',
    assetKey: character.assetKey,
    tier: character.tier,
    division: character.division ?? 4,
    mainPosition: character.mainPosition,
    subPosition: character.subPosition,
  }
}

interface CharacterFormModalProps {
  code: string
  open: boolean
  character?: Character
  onClose: () => void
}

export function CharacterFormModal({ code, open, character, onClose }: CharacterFormModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValues(character ? fromCharacter(character) : DEFAULT_VALUES)
      setError(null)
    }
  }, [open, character])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.characters(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.teamBoard(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })
  }

  const save = useMutation({
    mutationFn: (form: FormValues) => {
      const hasDivision = tierHasDivision(form.tier)
      if (character) {
        const body: UpdateCharacterRequest = {
          name: form.name.trim(),
          description: form.description.trim(),
          assetKey: form.assetKey,
          tier: form.tier,
          mainPosition: form.mainPosition,
          ...(hasDivision ? { division: form.division } : {}),
          ...(form.subPosition ? { subPosition: form.subPosition } : { clearSubPosition: true }),
        }
        return charactersApi.update(character.id, body)
      }
      const body: CreateCharacterRequest = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        assetKey: form.assetKey,
        tier: form.tier,
        division: hasDivision ? form.division : null,
        mainPosition: form.mainPosition,
        subPosition: form.subPosition,
      }
      return charactersApi.create(code, body)
    },
    onSuccess: (saved) => {
      toast.success(`${saved.name} 캐릭터 저장 완료!`)
      invalidate()
      onClose()
    },
    onError: (mutationError) => setError(errorMessage(mutationError, '캐릭터를 저장하지 못했습니다.')),
  })

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!values.name.trim()) {
      setError('캐릭터 이름을 입력해주세요.')
      return
    }
    if (values.subPosition === values.mainPosition) {
      setError('부 포지션은 주 포지션과 달라야 합니다.')
      return
    }
    save.mutate(values)
  }

  const showDivision = tierHasDivision(values.tier)
  const previewLabel = tierLabel(values.tier, showDivision ? values.division : null)

  return (
    <PixelModal
      open={open}
      title={character ? 'EDIT CHARACTER' : 'NEW CHARACTER'}
      onClose={onClose}
      width={640}
      footer={
        <>
          <PixelButton variant="ghost" onClick={onClose} disabled={save.isPending}>
            취소
          </PixelButton>
          <PixelButton variant="gold" form="character-form" type="submit" loading={save.isPending}>
            {character ? '저장' : '만들기'}
          </PixelButton>
        </>
      }
    >
      <form id="character-form" className="char-form" onSubmit={submit}>
        <div className="char-form__preview">
          <PixelAvatar assetKey={values.assetKey} size={96} />
          <div className="char-form__preview-name">{values.name.trim() || '이름 없는 선수'}</div>
          <div className="char-form__preview-tier font-pixel">{previewLabel}</div>
        </div>

        <div className="char-form__fields">
          <div className="px-field">
            <label className="px-label" htmlFor="char-name">
              캐릭터 이름
            </label>
            <input
              id="char-name"
              className="px-input"
              maxLength={NAME_MAX}
              value={values.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="예: 민준"
              autoFocus
            />
          </div>

          <div className="px-field">
            <label className="px-label" htmlFor="char-desc">
              한 줄 설명
            </label>
            <input
              id="char-desc"
              className="px-input"
              maxLength={DESCRIPTION_MAX}
              value={values.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="예: 라인전은 강하지만 한타에서 사라짐"
            />
          </div>

          <div className="px-field">
            <span className="px-label">도트 캐릭터</span>
            <div className="char-form__assets" role="radiogroup" aria-label="도트 캐릭터">
              {PLAYER_ASSET_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={values.assetKey === key}
                  className={values.assetKey === key ? 'char-form__asset char-form__asset--on' : 'char-form__asset'}
                  onClick={() => set('assetKey', key)}
                  title={key}
                >
                  <PixelAvatar assetKey={key} size={40} />
                </button>
              ))}
            </div>
          </div>

          <div className="char-form__row">
            <div className="px-field">
              <label className="px-label" htmlFor="char-tier">
                LOL 티어
              </label>
              <select
                id="char-tier"
                className="px-select"
                value={values.tier}
                onChange={(event) => set('tier', event.target.value as Tier)}
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {TIER_NAMES[tier]}
                  </option>
                ))}
              </select>
            </div>
            <div className="px-field">
              <label className="px-label" htmlFor="char-division">
                Division
              </label>
              <select
                id="char-division"
                className="px-select"
                value={showDivision ? values.division : ''}
                disabled={!showDivision}
                onChange={(event) => set('division', Number(event.target.value))}
              >
                {!showDivision && <option value="">없음</option>}
                {DIVISIONS.map((division) => (
                  <option key={division} value={division}>
                    {ROMAN[division]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-field">
            <span className="px-label">주 포지션</span>
            <PositionPicker
              value={values.mainPosition}
              onChange={(position) => position && set('mainPosition', position)}
            />
          </div>

          <div className="px-field">
            <span className="px-label">부 포지션</span>
            <PositionPicker
              value={values.subPosition}
              allowNone
              disabledPosition={values.mainPosition}
              onChange={(position) => set('subPosition', position)}
            />
          </div>

          {error && <p className="px-error">{error}</p>}
        </div>
      </form>
    </PixelModal>
  )
}

interface PositionPickerProps {
  value: Position | null
  onChange: (position: Position | null) => void
  allowNone?: boolean
  disabledPosition?: Position
}

function PositionPicker({ value, onChange, allowNone = false, disabledPosition }: PositionPickerProps) {
  return (
    <div className="char-form__positions" role="radiogroup">
      {allowNone && (
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          className={value === null ? 'char-form__pos char-form__pos--on' : 'char-form__pos'}
          onClick={() => onChange(null)}
        >
          없음
        </button>
      )}
      {POSITIONS.map((position) => {
        const disabled = position === disabledPosition
        return (
          <button
            key={position}
            type="button"
            role="radio"
            aria-checked={value === position}
            disabled={disabled}
            className={value === position ? 'char-form__pos char-form__pos--on' : 'char-form__pos'}
            onClick={() => onChange(position)}
          >
            <span aria-hidden>{POSITION_ICONS[position]}</span> {POSITION_LABELS[position]}
          </button>
        )
      })}
    </div>
  )
}

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
import { PositionBadge } from '@/components/PositionBadge'
import { useToast } from '@/components/Toast'
import { PLAYER_ASSET_KEYS } from '@/lib/assets'
import { POSITION_ICONS, POSITION_LABELS, TIER_NAMES, tierHasDivision, tierLabel } from '@/lib/labels'

const NAME_MAX = 20
const DESCRIPTION_MAX = 100
const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

type Tab = 'basic' | 'skin' | 'intro'

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'basic', icon: '📋', label: '기본 정보' },
  { key: 'skin', icon: '👤', label: '캐릭터 선택' },
  { key: 'intro', icon: '💬', label: '소개 문구' },
]

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

/** 초안의 "캐릭터 생성" 종이 패널: 좌측 세로 탭 · 중앙 폼 · 우측 대형 미리보기. */
export function CharacterFormModal({ code, open, character, onClose }: CharacterFormModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES)
  const [tab, setTab] = useState<Tab>('basic')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValues(character ? fromCharacter(character) : DEFAULT_VALUES)
      setTab('basic')
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

  const cycleSkin = (step: number) => {
    const index = PLAYER_ASSET_KEYS.indexOf(values.assetKey)
    const next = (index + step + PLAYER_ASSET_KEYS.length) % PLAYER_ASSET_KEYS.length
    set('assetKey', PLAYER_ASSET_KEYS[next])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!values.name.trim()) {
      setTab('basic')
      setError('캐릭터 이름을 입력해주세요.')
      return
    }
    if (values.subPosition === values.mainPosition) {
      setTab('basic')
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
      tone="paper"
      title={
        <>
          <span aria-hidden>🎽</span>
          {character ? '캐릭터 수정' : '캐릭터 생성'}
          <small>{character ? '선수 정보를 바꿔보세요!' : '나만의 선수 캐릭터를 만들어보세요!'}</small>
        </>
      }
      onClose={onClose}
      width={900}
      footer={
        <>
          <PixelButton variant="ghost" onClick={onClose} disabled={save.isPending}>
            취소
          </PixelButton>
          <PixelButton variant="blue" form="character-form" type="submit" size="lg" loading={save.isPending}>
            {character ? '저장하기' : '생성하기'}
          </PixelButton>
        </>
      }
    >
      <form id="character-form" className="cform" onSubmit={submit}>
        <nav className="cform__tabs" aria-label="입력 단계">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? 'cform__tab cform__tab--on' : 'cform__tab'}
              onClick={() => setTab(item.key)}
            >
              <span aria-hidden>{item.icon}</span>
              <span className="font-pixel-ko">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="cform__main">
          {tab === 'basic' && (
            <div className="cform__section">
              <div className="px-field">
                <label className="px-label" htmlFor="char-name">
                  이름 <span className="cform__max">(최대 {NAME_MAX}자)</span>
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

              <div className="cform__row">
                <div className="px-field">
                  <label className="px-label" htmlFor="char-tier">
                    등급
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
            </div>
          )}

          {tab === 'skin' && (
            <div className="cform__section">
              <span className="px-label">캐릭터 스킨 선택</span>
              <div className="cform__skins" role="radiogroup" aria-label="캐릭터 스킨">
                {PLAYER_ASSET_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={values.assetKey === key}
                    className={values.assetKey === key ? 'cform__skin cform__skin--on' : 'cform__skin'}
                    onClick={() => set('assetKey', key)}
                    title={key}
                  >
                    <PixelAvatar assetKey={key} size={44} variant="face" />
                  </button>
                ))}
              </div>
              <p className="cform__hint">
                스킨 이미지는 <code>public/assets/players/</code> 의 PNG 를 같은 이름으로 바꾸면 교체됩니다.
              </p>
            </div>
          )}

          {tab === 'intro' && (
            <div className="cform__section">
              <div className="px-field">
                <label className="px-label" htmlFor="char-desc">
                  한 줄 소개 <span className="cform__max">(최대 {DESCRIPTION_MAX}자)</span>
                </label>
                <textarea
                  id="char-desc"
                  className="px-textarea"
                  maxLength={DESCRIPTION_MAX}
                  rows={3}
                  value={values.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="예: 라인전은 강하지만 한타에서 사라짐"
                />
                <p className="cform__counter">
                  {values.description.length}/{DESCRIPTION_MAX}
                </p>
              </div>
              <p className="cform__hint">팀 배정 화면에서 이 문구가 말풍선으로 표시됩니다.</p>
            </div>
          )}

          {error && <p className="px-error">{error}</p>}
        </div>

        <aside className="cform__preview">
          <div className="cform__stage">
            <button type="button" className="cform__arrow" onClick={() => cycleSkin(-1)} aria-label="이전 스킨">
              ‹
            </button>
            <PixelAvatar assetKey={values.assetKey} size={128} />
            <PixelAvatar assetKey={values.assetKey} size={56} variant="face" className="cform__face" />
            <button type="button" className="cform__arrow" onClick={() => cycleSkin(1)} aria-label="다음 스킨">
              ›
            </button>
          </div>
          <div className="cform__plate">
            <span className="cform__plate-name font-pixel-ko">{values.name.trim() || '이름 없는 선수'}</span>
            <span className="cform__plate-tier font-pixel">{previewLabel}</span>
            <span className="cform__plate-pos">
              <PositionBadge position={values.mainPosition} />
              {values.subPosition && <PositionBadge position={values.subPosition} ghost />}
            </span>
          </div>
          <PixelButton variant="ghost" size="sm" onClick={() => cycleSkin(1)}>
            다른 캐릭터 보기
          </PixelButton>
        </aside>
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
    <div className="cform__positions" role="radiogroup">
      {allowNone && (
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          className={value === null ? 'cform__pos cform__pos--on' : 'cform__pos'}
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
            className={value === position ? 'cform__pos cform__pos--on' : 'cform__pos'}
            onClick={() => onChange(position)}
          >
            <span aria-hidden>{POSITION_ICONS[position]}</span> {POSITION_LABELS[position]}
          </button>
        )
      })}
    </div>
  )
}

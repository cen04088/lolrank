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
import { ASSET_GROUPS, PLAYER_ASSET_KEYS, assetLabel, isSpecialAsset } from '@/lib/assets'
import { POSITION_ICONS, POSITION_LABELS, TIER_NAMES, tierHasDivision, tierLabel } from '@/lib/labels'

const NAME_MAX = 20
const TITLE_MAX = 20
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
  title: string
  description: string
  assetKey: string
  tier: Tier
  division: number
  mainPosition: Position
  subPositions: Position[]
}

const DEFAULT_VALUES: FormValues = {
  name: '',
  title: '',
  description: '',
  assetKey: PLAYER_ASSET_KEYS[0],
  tier: 'GOLD',
  division: 4,
  mainPosition: 'MID',
  subPositions: [],
}

function fromCharacter(character: Character): FormValues {
  return {
    name: character.name,
    title: character.title ?? '',
    description: character.description ?? '',
    assetKey: character.assetKey,
    tier: character.tier,
    division: character.division ?? 4,
    mainPosition: character.mainPosition,
    subPositions: character.subPositions,
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
          title: form.title.trim(),
          description: form.description.trim(),
          assetKey: form.assetKey,
          tier: form.tier,
          mainPosition: form.mainPosition,
          ...(hasDivision ? { division: form.division } : {}),
          subPositions: form.subPositions,
        }
        return charactersApi.update(character.id, body)
      }
      const body: CreateCharacterRequest = {
        name: form.name.trim(),
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        assetKey: form.assetKey,
        tier: form.tier,
        division: hasDivision ? form.division : null,
        mainPosition: form.mainPosition,
        subPositions: form.subPositions,
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

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    // 값을 고치기 시작하면 이전 제출의 오류 문구는 지운다.
    setError(null)
  }

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

              <div className="px-field">
                <label className="px-label" htmlFor="char-title">
                  칭호 <span className="cform__max">(선택, 최대 {TITLE_MAX}자 · 이름 옆에 표시)</span>
                </label>
                <input
                  id="char-title"
                  className="px-input"
                  maxLength={TITLE_MAX}
                  value={values.title}
                  onChange={(event) => set('title', event.target.value)}
                  placeholder="예: 철벽 탑솔, 한타의 신"
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
                  onChange={(position) =>
                    setValues((prev) => ({
                      ...prev,
                      mainPosition: position,
                      // 주 포지션으로 고른 자리는 부 포지션에서 자동으로 뺀다
                      subPositions: prev.subPositions.filter((p) => p !== position),
                    }))
                  }
                />
              </div>

              <div className="px-field">
                <span className="px-label">
                  부 포지션 <span className="cform__max">(여러 개 선택 가능)</span>
                </span>
                <MultiPositionPicker
                  value={values.subPositions}
                  disabledPosition={values.mainPosition}
                  onChange={(positions) => set('subPositions', positions)}
                />
              </div>
            </div>
          )}

          {tab === 'skin' && (
            <div className="cform__section">
              {ASSET_GROUPS.map((group) => (
                <div key={group.id} className="cform__skin-group">
                  <span className="px-label">
                    캐릭터 스킨 선택 <span className="cform__max">· {group.label}</span>
                  </span>
                  <div className="cform__skins" role="radiogroup" aria-label={`${group.label} 캐릭터 스킨`}>
                    {group.keys.map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={values.assetKey === key}
                        className={values.assetKey === key ? 'cform__skin cform__skin--on' : 'cform__skin'}
                        onClick={() => set('assetKey', key)}
                        title={assetLabel(key)}
                      >
                        <PixelAvatar assetKey={key} size={48} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="cform__hint">
                Tiny Swords 기사단·고블린과 특별 제작된 특수 인물입니다. 팀 배정 화면에서는 얼굴을 중심으로, 계급도에서는 전신이 보입니다.
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
          <div className={isSpecialAsset(values.assetKey) ? 'cform__stage cform__stage--special' : 'cform__stage'}>
            <button type="button" className="cform__arrow" onClick={() => cycleSkin(-1)} aria-label="이전 스킨">
              ‹
            </button>
            <PixelAvatar assetKey={values.assetKey} size={176} className="cform__hero" />
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
              {values.subPositions.map((position) => (
                <PositionBadge key={position} position={position} ghost />
              ))}
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
  value: Position
  onChange: (position: Position) => void
}

/** 주 포지션: 하나만 선택 */
function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div className="cform__positions" role="radiogroup">
      {POSITIONS.map((position) => (
        <button
          key={position}
          type="button"
          role="radio"
          aria-checked={value === position}
          className={value === position ? 'cform__pos cform__pos--on' : 'cform__pos'}
          onClick={() => onChange(position)}
        >
          <span aria-hidden>{POSITION_ICONS[position]}</span> {POSITION_LABELS[position]}
        </button>
      ))}
    </div>
  )
}

interface MultiPositionPickerProps {
  value: Position[]
  onChange: (positions: Position[]) => void
  disabledPosition?: Position
}

/** 부 포지션: 여러 개 토글. 주 포지션은 비활성. */
function MultiPositionPicker({ value, onChange, disabledPosition }: MultiPositionPickerProps) {
  const toggle = (position: Position) => {
    if (value.includes(position)) {
      onChange(value.filter((p) => p !== position))
    } else {
      // 포지션 순서(TOP→SUPPORT)대로 정렬해 저장
      onChange(POSITIONS.filter((p) => p === position || value.includes(p)))
    }
  }
  return (
    <div className="cform__positions" role="group">
      <button
        type="button"
        aria-pressed={value.length === 0}
        className={value.length === 0 ? 'cform__pos cform__pos--on' : 'cform__pos'}
        onClick={() => onChange([])}
      >
        없음
      </button>
      {POSITIONS.map((position) => {
        const disabled = position === disabledPosition
        const on = value.includes(position)
        return (
          <button
            key={position}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            className={on ? 'cform__pos cform__pos--on' : 'cform__pos'}
            onClick={() => toggle(position)}
            title={disabled ? '주 포지션은 부 포지션으로 고를 수 없습니다.' : undefined}
          >
            <span aria-hidden>{POSITION_ICONS[position]}</span> {POSITION_LABELS[position]}
          </button>
        )
      })}
    </div>
  )
}

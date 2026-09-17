import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DND_ANNOUNCEMENTS, DND_SCREEN_READER_INSTRUCTIONS } from '@/lib/dnd'
import { useCharacters, useTeamBoard } from '@/api/queries'
import type { AutoFillMode, Character } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { PixelIcon } from '@/components/PixelIcon'
import { PixelLoader } from '@/components/PixelLoader'
import { ConfirmModal } from '@/components/PixelModal'
import { useTeamBoardMutations } from '../hooks/useTeamBoardMutations'
import {
  applyDrop,
  benchCharacters,
  changedSlotIds,
  clearBoard,
  emptySlotCount,
  normalizeSlots,
  slotsForTeam,
  type DragData,
  type DropData,
} from '../utils/board'
import { CharacterChip } from './CharacterChip'
import { ModeTabs } from './ModeTabs'
import { ParticipantPicker } from './ParticipantPicker'
import { Pitch } from './Pitch'
import { CasterPanel } from './CasterPanel'
import { PowerBar } from './PowerBar'
import { TeamColumn } from './TeamColumn'
import './team-maker.css'

const AUTO_FILL_POP_RESET_MS = 1600
const DRAG_ACTIVATION_DISTANCE = 6
const MAX_PARTICIPANTS = 10

/** 포인터가 들어간 영역을 우선하고, 없으면 사각형 교차로 판정한다. */
const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : rectIntersection(args)
}

interface TeamMakerProps {
  code: string
}

export function TeamMaker({ code }: TeamMakerProps) {
  const characters = useCharacters(code)
  const board = useTeamBoard(code)
  const { updateBoard, autoFill, updateParticipants } = useTeamBoardMutations(code)

  const [activeCharacterId, setActiveCharacterId] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [mode, setMode] = useState<AutoFillMode>('SKILL_BALANCE')
  const [popSlots, setPopSlots] = useState<Record<string, number>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
  )

  const charactersById = useMemo(() => {
    const map = new Map<number, Character>()
    for (const character of characters.data ?? []) map.set(character.id, character)
    return map
  }, [characters.data])

  const slots = useMemo(() => normalizeSlots(board.data?.slots ?? []), [board.data?.slots])

  const participants = useMemo(
    () =>
      (board.data?.participantIds ?? [])
        .map((id) => charactersById.get(id))
        .filter((character): character is Character => character !== undefined),
    [board.data?.participantIds, charactersById],
  )

  const bench = useMemo(() => benchCharacters(participants, slots), [participants, slots])
  const activeCharacter = activeCharacterId !== null ? charactersById.get(activeCharacterId) : undefined

  if (characters.isPending || board.isPending) {
    return <PixelLoader label="LOADING BOARD" />
  }

  if (characters.isError || board.isError) {
    return (
      <EmptyState
        icon="⚠"
        message="팀 보드를 불러오지 못했습니다."
        hint="서버 연결을 확인한 뒤 다시 시도해주세요."
        action={
          <PixelButton
            variant="gold"
            onClick={() => {
              characters.refetch()
              board.refetch()
            }}
          >
            다시 시도
          </PixelButton>
        }
      />
    )
  }

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    setActiveCharacterId(data?.characterId ?? null)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCharacterId(null)
    const data = event.active.data.current as DragData | undefined
    const target = event.over?.data.current as DropData | undefined
    if (!data || !target) return
    const next = applyDrop(slots, data.characterId, target)
    if (next === slots) return
    updateBoard.mutate(next)
  }

  const handleAutoFill = () => {
    autoFill.mutate(mode, {
      onSuccess: (result) => {
        const changed = changedSlotIds(slots, normalizeSlots(result.slots))
        setPopSlots(Object.fromEntries(changed.map((id, index) => [id, index])))
        window.setTimeout(() => setPopSlots({}), AUTO_FILL_POP_RESET_MS)
      },
    })
  }

  const handleReset = () => {
    setResetOpen(false)
    updateBoard.mutate(clearBoard(slots))
  }

  const boardEmpty = emptySlotCount(slots) === slots.length
  const autoFillDisabled = bench.length === 0 || emptySlotCount(slots) === 0
  const noCharacters = characters.data.length === 0

  return (
    <>
      <div className="tmk">
        <header className="tmk__head">
          <div className="page-title">
            <span className="page-title__icon" aria-hidden>
              <PixelIcon name="icon_guard" size={44} />
            </span>
            <div className="page-title__text">
              <h1>팀 배정</h1>
              <p>오늘도 즐거운 내전!</p>
            </div>
          </div>
          {!noCharacters && (
            <PixelButton variant="blue" icon="👥" onClick={() => setPickerOpen(true)}>
              참가자 선택
              <span className="tmk__count font-pixel">
                {participants.length}/{MAX_PARTICIPANTS}
              </span>
            </PixelButton>
          )}
        </header>

        {noCharacters ? (
          <EmptyState
            icon="🏟"
            message="아직 등록된 선수가 없습니다!"
            hint="캐릭터를 만들면 이 자리에 도트 선수들이 등장합니다."
            action={
              <Link to={`/room/${code}/characters`}>
                <PixelButton variant="gold">첫 캐릭터 만들기</PixelButton>
              </Link>
            }
          />
        ) : (
          <DndContext
            accessibility={{ announcements: DND_ANNOUNCEMENTS, screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS }}
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveCharacterId(null)}
          >
            <ModeTabs value={mode} onChange={setMode} />

            <div className="tmk__board">
              <TeamColumn
                team="BLUE"
                slots={slotsForTeam(slots, 'BLUE')}
                charactersById={charactersById}
                activeCharacter={activeCharacter}
                popSlots={popSlots}
              />
              <Pitch
                bench={bench}
                participantCount={participants.length}
                totalCharacters={characters.data.length}
                dragging={activeCharacter !== undefined}
                onOpenPicker={() => setPickerOpen(true)}
              />
              <TeamColumn
                team="RED"
                slots={slotsForTeam(slots, 'RED')}
                charactersById={charactersById}
                activeCharacter={activeCharacter}
                popSlots={popSlots}
              />
            </div>

            <PowerBar balance={board.data.balance} boardEmpty={boardEmpty} syncing={updateBoard.isPending} />

            <CasterPanel
              code={code}
              boardKey={slots.map((s) => `${s.team}:${s.position}:${s.characterId ?? ''}`).join('|')}
              boardFull={emptySlotCount(slots) === 0}
            />

            <div className="tmk__actions">
              <PixelButton
                variant="gold"
                size="lg"
                icon={<PixelIcon name="big_sword" size={22} />}
                className="tmk__autofill"
                onClick={handleAutoFill}
                loading={autoFill.isPending}
                disabled={autoFillDisabled}
                title={autoFillDisabled ? '대기 선수가 있고 빈 자리가 있을 때 사용할 수 있습니다.' : undefined}
              >
                남은 자리 균형 맞춰 채우기
              </PixelButton>
              <PixelButton variant="ghost" size="lg" onClick={() => setResetOpen(true)} disabled={boardEmpty}>
                전체 초기화
              </PixelButton>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeCharacter ? <CharacterChip character={activeCharacter} variant="overlay" /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <ParticipantPicker
        open={pickerOpen}
        characters={characters.data}
        selectedIds={board.data.participantIds}
        saving={updateParticipants.isPending}
        onClose={() => setPickerOpen(false)}
        onSave={(ids) => updateParticipants.mutate(ids, { onSuccess: () => setPickerOpen(false) })}
      />

      <ConfirmModal
        open={resetOpen}
        title="RESET BOARD"
        message="배치된 모든 캐릭터를 대기석으로 되돌립니다. 오늘의 참가자 선택은 유지됩니다."
        confirmLabel="전체 초기화"
        danger
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </>
  )
}

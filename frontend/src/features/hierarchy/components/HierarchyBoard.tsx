import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DND_ANNOUNCEMENTS, DND_SCREEN_READER_INSTRUCTIONS } from '@/lib/dnd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { charactersApi, hierarchyApi } from '@/api/endpoints'
import { queryKeys, useCharacters } from '@/api/queries'
import { HIERARCHY_RANKS, type Character, type HierarchyEntry, type HierarchyRank } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { PixelIcon } from '@/components/PixelIcon'
import { WalkingSprite } from '@/components/WalkingSprite'
import { NPC_ELDER_KEY } from '@/lib/assets'
import { PixelLoader } from '@/components/PixelLoader'
import { ConfirmModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'
import { CharacterFormModal } from '@/features/characters/components/CharacterFormModal'
import {
  groupByRank,
  moveCharacter,
  parseCardSortId,
  parseRankDropId,
  toEntries,
  totalCount,
  type RankBuckets,
} from '../utils/hierarchy'
import { CharacterDetailCard } from './CharacterDetailCard'
import { RankRow } from './RankRow'
import { TrophyCard } from './TrophyCard'
import { rankScore } from '@/lib/labels'
import './hierarchy.css'

/** 선택한 카드가 자기 계급 안에서 몇 번째인지 + 그에 따른 등급 점수 */
function placementOf(buckets: Record<HierarchyRank, Character[]>, character: Character) {
  const members = buckets[character.hierarchyRank] ?? []
  const index = members.findIndex((c) => c.id === character.id)
  if (index < 0) return undefined
  return { index, count: members.length, score: rankScore(character.hierarchyRank, index, members.length) }
}

const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : closestCorners(args)
}

interface HierarchyBoardProps {
  code: string
}

export function HierarchyBoard({ code }: HierarchyBoardProps) {
  const characters = useCharacters(code)
  const queryClient = useQueryClient()
  const toast = useToast()

  /** 드래그 직후 서버 응답 전까지 보여줄 낙관적 상태. null 이면 서버 데이터를 그대로 쓴다. */
  const [draft, setDraft] = useState<RankBuckets | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Character | null>(null)
  const [deleting, setDeleting] = useState<Character | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const serverBuckets = useMemo(() => groupByRank(characters.data ?? []), [characters.data])
  const buckets = draft ?? serverBuckets

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.characters(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.teamBoard(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })
  }

  const update = useMutation({
    mutationFn: (entries: HierarchyEntry[]) => hierarchyApi.update(code, entries),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.characters(code), updated)
      setDraft(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })
    },
    onError: (error) => {
      setDraft(null)
      toast.error(errorMessage(error, '계급도를 저장하지 못했습니다. 다시 시도해주세요.'))
    },
  })

  const remove = useMutation({
    mutationFn: (character: Character) => charactersApi.remove(character.id),
    onSuccess: (_result, character) => {
      toast.success(`${character.name} 캐릭터를 삭제했습니다.`)
      setDeleting(null)
      setSelectedId(null)
      invalidateAll()
    },
    onError: (error) => toast.error(errorMessage(error, '캐릭터를 삭제하지 못했습니다.')),
  })

  if (characters.isPending) return <PixelLoader label="LOADING HALL OF FAME" />

  if (characters.isError) {
    return (
      <EmptyState
        icon="⚠"
        message="계급도를 불러오지 못했습니다."
        action={
          <PixelButton variant="gold" onClick={() => characters.refetch()}>
            다시 시도
          </PixelButton>
        }
      />
    )
  }

  const all = characters.data
  const selected = selectedId !== null ? all.find((c) => c.id === selectedId) : undefined
  const activeCharacter: Character | undefined = activeId !== null ? all.find((c) => c.id === activeId) : undefined

  const commit = (next: RankBuckets) => {
    if (next === buckets) return
    setDraft(next)
    update.mutate(toEntries(next))
  }

  const onDragStart = (event: DragStartEvent) => {
    const id = parseCardSortId(String(event.active.id))
    setActiveId(id)
    if (id !== null) setSelectedId(id)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const characterId = parseCardSortId(String(event.active.id))
    if (characterId === null || !event.over) return

    const overId = String(event.over.id)
    let targetRank: HierarchyRank | null = parseRankDropId(overId)
    let targetIndex: number

    if (targetRank) {
      targetIndex = buckets[targetRank].length
    } else {
      const overCharacterId = parseCardSortId(overId)
      if (overCharacterId === null) return
      targetRank = HIERARCHY_RANKS.find((rank) => buckets[rank].some((c) => c.id === overCharacterId)) ?? null
      if (!targetRank) return
      targetIndex = buckets[targetRank].findIndex((c) => c.id === overCharacterId)
    }

    commit(moveCharacter(buckets, characterId, targetRank, targetIndex))
  }

  const changeRank = (character: Character, rank: HierarchyRank) => {
    commit(moveCharacter(buckets, character.id, rank, buckets[rank].length))
  }

  return (
    <>
      <div className="hier">
        <header className="hier__head">
          <div className="page-title">
            <span className="page-title__icon" aria-hidden>
              <PixelIcon name="gold_cup" size={44} />
            </span>
            <div className="page-title__text">
              <h1>계급도</h1>
              <p>우리의 전설은 계속된다.</p>
            </div>
          </div>
          <p className="hier__help">
            카드를 끌어서 계급을 올리거나 내리세요. 같은 계급 안에서는 앞(왼쪽)에 있을수록 등급 점수가 높습니다. 클릭하면 오른쪽에 상세 정보가 나타납니다.
            {update.isPending && <span className="hier__saving font-pixel"> SAVING</span>}
          </p>
        </header>

        {totalCount(buckets) === 0 ? (
          <EmptyState
            icon="👑"
            message="아직 계급도가 비어 있습니다."
            hint="캐릭터를 만들면 C RANK 에서 시작합니다."
            action={
              <Link to={`/room/${code}/characters`}>
                <PixelButton variant="gold">캐릭터 만들기</PixelButton>
              </Link>
            }
          />
        ) : (
          <div className="hier__layout">
            <DndContext
              accessibility={{ announcements: DND_ANNOUNCEMENTS, screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS }}
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <div className="tower">
                <div className="tower__banner tower__banner--left font-pixel" aria-hidden>
                  <span>GOOD</span>
                  <span>GAME</span>
                  <span>BETTER</span>
                  <span>FRIENDS</span>
                </div>
                <div className="tower__floors">
                  {HIERARCHY_RANKS.map((rank) => (
                    <RankRow
                      key={rank}
                      rank={rank}
                      characters={buckets[rank]}
                      dragging={activeId !== null}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>
                <div className="tower__banner tower__banner--right font-pixel" aria-hidden>
                  <span>PLAY</span>
                  <span>RANK UP</span>
                  <span>REACH</span>
                  <span>THE TOP</span>
                </div>
              </div>
              <DragOverlay dropAnimation={null}>
                {activeCharacter ? (
                  <TrophyCard character={activeCharacter} rank={activeCharacter.hierarchyRank} overlay />
                ) : null}
              </DragOverlay>
            </DndContext>

            <aside className="hier__side">
              <CharacterDetailCard
                character={selected}
                rankPlacement={selected ? placementOf(buckets, selected) : undefined}
                onChangeRank={(rank) => selected && changeRank(selected, rank)}
                onEdit={() => selected && setEditing(selected)}
                onDelete={() => selected && setDeleting(selected)}
              />
              <div className="npc" aria-hidden>
                <div className="npc__bubble bubble bubble--right font-pixel-ko">언젠가, 너도 국가권력급이 될 수 있어!</div>
                <WalkingSprite assetKey={NPC_ELDER_KEY} direction="down" size={64} paused className="npc__sprite" />
              </div>
            </aside>
          </div>
        )}
      </div>

      <CharacterFormModal code={code} open={editing !== null} character={editing ?? undefined} onClose={() => setEditing(null)} />

      <ConfirmModal
        open={deleting !== null}
        title="DELETE CHARACTER"
        message={
          deleting ? (
            <>
              <strong>{deleting.name}</strong> 캐릭터를 삭제할까요? 팀 보드와 계급도에서도 함께 사라지며 되돌릴 수
              없습니다.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="삭제"
        danger
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}

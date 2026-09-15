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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { hierarchyApi } from '@/api/endpoints'
import { queryKeys, useCharacters } from '@/api/queries'
import { HIERARCHY_RANKS, type Character, type HierarchyEntry, type HierarchyRank } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { PixelLoader } from '@/components/PixelLoader'
import { useToast } from '@/components/Toast'
import {
  groupByRank,
  moveCharacter,
  parseCardSortId,
  parseRankDropId,
  toEntries,
  totalCount,
  type RankBuckets,
} from '../utils/hierarchy'
import { RankRow } from './RankRow'
import { TrophyCard } from './TrophyCard'
import './hierarchy.css'

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const serverBuckets = useMemo(() => groupByRank(characters.data ?? []), [characters.data])
  const buckets = draft ?? serverBuckets

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

  if (totalCount(buckets) === 0) {
    return (
      <EmptyState
        icon="👑"
        message="아직 계급도가 비어 있습니다."
        hint="캐릭터를 만들면 C RANK 에서 시작합니다."
        action={
          <Link to={`/room/${code}/characters`}>
            <PixelButton variant="gold" pixelFont>
              캐릭터 만들기
            </PixelButton>
          </Link>
        }
      />
    )
  }

  const activeCharacter: Character | undefined =
    activeId !== null ? (characters.data ?? []).find((c) => c.id === activeId) : undefined

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(parseCardSortId(String(event.active.id)))
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

    const next = moveCharacter(buckets, characterId, targetRank, targetIndex)
    if (next === buckets) return
    setDraft(next)
    update.mutate(toEntries(next))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="hier">
        <header className="hier__head">
          <h1 className="hier__title font-pixel">HALL OF FAME</h1>
          <p className="hier__sub">
            캐릭터를 끌어서 계급을 올리거나 내리세요. 같은 계급 안에서도 순서를 바꿀 수 있습니다.
            {update.isPending && <span className="hier__saving font-pixel"> SAVING</span>}
          </p>
        </header>
        <div className="hier__tower">
          {HIERARCHY_RANKS.map((rank) => (
            <RankRow key={rank} rank={rank} characters={buckets[rank]} dragging={activeId !== null} />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCharacter ? <TrophyCard character={activeCharacter} rank={activeCharacter.hierarchyRank} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

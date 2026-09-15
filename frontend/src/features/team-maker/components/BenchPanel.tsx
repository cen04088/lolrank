import { useDroppable } from '@dnd-kit/core'
import type { Character } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { PixelPanel } from '@/components/PixelPanel'
import { BENCH_DROP_ID, type DropData } from '../utils/board'
import { CharacterChip } from './CharacterChip'

const MAX_PARTICIPANTS = 10

interface BenchPanelProps {
  bench: Character[]
  participantCount: number
  totalCharacters: number
  dragging: boolean
  onOpenPicker: () => void
}

export function BenchPanel({ bench, participantCount, totalCharacters, dragging, onOpenPicker }: BenchPanelProps) {
  const dropData: DropData = { kind: 'bench' }
  const { setNodeRef, isOver } = useDroppable({ id: BENCH_DROP_ID, data: dropData })

  const areaClasses = [
    'tm-bench__area',
    dragging && 'tm-bench__area--droppable',
    isOver && 'tm-bench__area--over',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <PixelPanel
      tone="grass"
      className="tm-bench"
      title={
        <>
          TODAY&apos;S PLAYERS
          <span className="tm-bench__count">
            {participantCount}/{MAX_PARTICIPANTS}
          </span>
        </>
      }
      actions={
        <PixelButton size="sm" variant="gold" onClick={onOpenPicker}>
          참가자 선택
        </PixelButton>
      }
    >
      <div ref={setNodeRef} className={areaClasses}>
        {participantCount === 0 ? (
          <EmptyState
            icon="📋"
            message="오늘의 내전 멤버를 선택해주세요."
            hint={`전체 캐릭터 ${totalCharacters}명 중 최대 ${MAX_PARTICIPANTS}명`}
            action={
              <PixelButton variant="gold" onClick={onOpenPicker}>
                참가자 선택
              </PixelButton>
            }
            className="tm-bench__empty"
          />
        ) : bench.length === 0 ? (
          <div className="tm-bench__done">
            <span className="font-pixel text-gold">ALL SET!</span>
            <p>모든 참가자가 배치되었습니다.</p>
            <small className="text-muted">캐릭터를 여기로 끌어오면 대기석으로 돌아옵니다.</small>
          </div>
        ) : (
          <ul className="tm-bench__list">
            {bench.map((character) => (
              <li key={character.id}>
                <CharacterChip character={character} from={{ kind: 'bench' }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PixelPanel>
  )
}

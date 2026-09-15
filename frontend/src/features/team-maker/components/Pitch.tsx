import { useDroppable } from '@dnd-kit/core'
import type { Character } from '@/api/types'
import { PixelButton } from '@/components/PixelButton'
import { BENCH_DROP_ID, type DropData } from '../utils/board'
import { CharacterChip } from './CharacterChip'

interface PitchProps {
  bench: Character[]
  participantCount: number
  totalCharacters: number
  dragging: boolean
  onOpenPicker: () => void
}

/** 중앙 잔디밭: VS 엠블럼 + 대기 선수(벤치). 슬롯의 캐릭터를 여기로 끌어오면 대기석으로 돌아온다. */
export function Pitch({ bench, participantCount, totalCharacters, dragging, onOpenPicker }: PitchProps) {
  const dropData: DropData = { kind: 'bench' }
  const { setNodeRef, isOver } = useDroppable({ id: BENCH_DROP_ID, data: dropData })

  const classes = ['pitch', dragging && 'pitch--droppable', isOver && 'pitch--over'].filter(Boolean).join(' ')

  return (
    <section ref={setNodeRef} className={classes} aria-label="대기 선수">
      <div className="pitch__vs font-pixel" aria-hidden>
        VS
      </div>

      <div className="pitch__bench">
        <h3 className="pitch__bench-title font-pixel-ko">
          대기 선수 <span className="font-pixel">{bench.length}</span>
        </h3>

        {participantCount === 0 ? (
          <div className="pitch__empty">
            <p className="font-pixel-ko">오늘의 내전 멤버를 선택해주세요.</p>
            <small>
              전체 {totalCharacters}명 중 최대 10명
            </small>
            <PixelButton variant="gold" size="sm" onClick={onOpenPicker}>
              참가자 선택
            </PixelButton>
          </div>
        ) : bench.length === 0 ? (
          <div className="pitch__empty">
            <p className="font-pixel text-gold">ALL SET!</p>
            <small>모든 참가자가 배치되었습니다.{dragging ? ' 여기에 놓으면 대기석으로 돌아옵니다.' : ''}</small>
          </div>
        ) : (
          <ul className="pitch__list">
            {bench.map((character) => (
              <li key={character.id}>
                <CharacterChip character={character} variant="bench" from={{ kind: 'bench' }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

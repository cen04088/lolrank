import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core'

/**
 * dnd-kit 기본 스크린리더 안내는 영어("Draggable item card:2 was dropped over ...")다.
 * 두 DndContext(계급도, 팀 배정) 가 같은 한국어 안내를 쓴다.
 */
export const DND_SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    '드래그 가능한 항목입니다. 스페이스나 엔터로 들어 올리고, 방향키로 옮긴 뒤 다시 스페이스나 엔터로 내려놓습니다. Esc 로 취소합니다.',
}

export const DND_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `${labelOf(active.id)} 카드를 들었습니다.`,
  onDragOver: ({ over }) => (over ? `${labelOf(over.id)} 위에 있습니다.` : '놓을 수 있는 자리 밖입니다.'),
  onDragEnd: ({ over }) => (over ? `${labelOf(over.id)} 에 놓았습니다.` : '원래 자리로 돌아갔습니다.'),
  onDragCancel: () => '이동을 취소했습니다.',
}

/** "card:12"/"char:12" → "선수 카드 12", "rank:S" → "S 계급", "slot:BLUE:MID" → "BLUE MID 슬롯" 같은 읽기 쉬운 표기 */
function labelOf(id: string | number): string {
  const [kind, ...rest] = String(id).split(':')
  switch (kind) {
    case 'card':
    case 'char':
      return `선수 카드 ${rest.join(' ')}`
    case 'rank':
      return `${rest.join(' ')} 계급`
    case 'slot':
      return `${rest.join(' ')} 슬롯`
    case 'bench':
      return '대기 선수'
    default:
      return String(id)
  }
}

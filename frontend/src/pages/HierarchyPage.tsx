import { useRoomCode } from '@/pages/RoomLayout'
import { HierarchyBoard } from '@/features/hierarchy/components/HierarchyBoard'

export function HierarchyPage() {
  const code = useRoomCode()
  return <HierarchyBoard code={code} />
}

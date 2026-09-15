import { Scene } from '@/components/Scene'
import { useRoomCode } from '@/pages/RoomLayout'
import { HierarchyBoard } from '@/features/hierarchy/components/HierarchyBoard'

export function HierarchyPage() {
  const code = useRoomCode()
  return (
    <Scene kind="castle">
      <div className="page">
        <HierarchyBoard code={code} />
      </div>
    </Scene>
  )
}

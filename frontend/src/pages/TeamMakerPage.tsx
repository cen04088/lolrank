import { Scene } from '@/components/Scene'
import { useRoomCode } from '@/pages/RoomLayout'
import { TeamMaker } from '@/features/team-maker/components/TeamMaker'

export function TeamMakerPage() {
  const code = useRoomCode()
  return (
    <Scene kind="dungeon">
      <div className="page">
        <TeamMaker code={code} />
      </div>
    </Scene>
  )
}

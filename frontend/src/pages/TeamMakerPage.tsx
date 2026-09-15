import { useRoomCode } from '@/pages/RoomLayout'
import { TeamMaker } from '@/features/team-maker/components/TeamMaker'

export function TeamMakerPage() {
  const code = useRoomCode()
  return <TeamMaker code={code} />
}

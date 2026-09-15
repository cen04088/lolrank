import { Scene } from '@/components/Scene'
import { useRoomCode } from '@/pages/RoomLayout'
import { CharacterManager } from '@/features/characters/components/CharacterManager'

export function CharactersPage() {
  const code = useRoomCode()
  return (
    <Scene kind="dungeon">
      <div className="page">
        <CharacterManager code={code} />
      </div>
    </Scene>
  )
}

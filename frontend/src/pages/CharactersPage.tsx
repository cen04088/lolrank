import { useRoomCode } from '@/pages/RoomLayout'
import { CharacterManager } from '@/features/characters/components/CharacterManager'

export function CharactersPage() {
  const code = useRoomCode()
  return <CharacterManager code={code} />
}

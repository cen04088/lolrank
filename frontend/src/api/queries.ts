import { useQuery } from '@tanstack/react-query'
import { aiApi, changeLogsApi, charactersApi, matchesApi, roomsApi, teamBoardApi } from './endpoints'

export const queryKeys = {
  room: (code: string) => ['room', code] as const,
  characters: (code: string) => ['characters', code] as const,
  teamBoard: (code: string) => ['teamBoard', code] as const,
  changeLogs: (code: string) => ['changeLogs', code] as const,
  aiStatus: ['aiStatus'] as const,
  matches: (code: string) => ['matches', code] as const,
  ratings: (code: string) => ['ratings', code] as const,
}

export function useRoom(code: string) {
  return useQuery({
    queryKey: queryKeys.room(code),
    queryFn: () => roomsApi.get(code),
    retry: (failureCount, error) =>
      failureCount < 2 && !(error instanceof Error && 'status' in error && error.status === 404),
  })
}

export function useCharacters(code: string) {
  return useQuery({
    queryKey: queryKeys.characters(code),
    queryFn: () => charactersApi.list(code),
  })
}

export function useTeamBoard(code: string) {
  return useQuery({
    queryKey: queryKeys.teamBoard(code),
    queryFn: () => teamBoardApi.get(code),
  })
}

export function useChangeLogs(code: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.changeLogs(code),
    queryFn: () => changeLogsApi.list(code),
    enabled,
  })
}

/** AI 기능 사용 가능 여부. 서버 설정이라 거의 바뀌지 않으므로 오래 캐시한다. */
export function useAiStatus() {
  return useQuery({
    queryKey: queryKeys.aiStatus,
    queryFn: aiApi.status,
    staleTime: 10 * 60_000,
    retry: 0,
  })
}

export function useMatches(code: string) {
  return useQuery({
    queryKey: queryKeys.matches(code),
    queryFn: () => matchesApi.list(code),
    enabled: Boolean(code),
  })
}

/** 선수별 기록 보정치. characterId → Rating 맵으로 돌려준다. */
export function useRatings(code: string) {
  return useQuery({
    queryKey: queryKeys.ratings(code),
    queryFn: async () => {
      const list = await matchesApi.ratings(code)
      return new Map(list.map((r) => [r.characterId, r]))
    },
    enabled: Boolean(code),
  })
}

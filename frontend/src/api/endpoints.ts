import { api } from './client'
import type {
  AiStatus,
  AutoFillMode,
  ChangeLog,
  Character,
  Commentary,
  CreateCharacterRequest,
  HierarchyEntry,
  MatchRecord,
  Rating,
  RecordMatchRequest,
  Room,
  SlotRequest,
  TeamBoard,
  UpdateCharacterRequest,
  UpdateMatchRequest,
} from './types'

export const roomsApi = {
  /** 단일 방 모드의 기본 방 */
  getDefault: () => api<Room>('/api/rooms/default'),
  create: (name: string) => api<Room>('/api/rooms', { method: 'POST', body: { name } }),
  get: (inviteCode: string) => api<Room>(`/api/rooms/${encodeURIComponent(inviteCode)}`),
}

export const charactersApi = {
  list: (inviteCode: string) => api<Character[]>(`/api/rooms/${inviteCode}/characters`),
  create: (inviteCode: string, body: CreateCharacterRequest) =>
    api<Character>(`/api/rooms/${inviteCode}/characters`, { method: 'POST', body }),
  update: (characterId: number, body: UpdateCharacterRequest) =>
    api<Character>(`/api/characters/${characterId}`, { method: 'PATCH', body }),
  remove: (characterId: number) => api<void>(`/api/characters/${characterId}`, { method: 'DELETE' }),
}

export const teamBoardApi = {
  get: (inviteCode: string) => api<TeamBoard>(`/api/rooms/${inviteCode}/team-board`),
  updateParticipants: (inviteCode: string, characterIds: number[]) =>
    api<TeamBoard>(`/api/rooms/${inviteCode}/participants`, { method: 'PUT', body: { characterIds } }),
  update: (inviteCode: string, slots: SlotRequest[]) =>
    api<TeamBoard>(`/api/rooms/${inviteCode}/team-board`, { method: 'PUT', body: { slots } }),
  autoFill: (inviteCode: string, mode: AutoFillMode) =>
    api<TeamBoard>(`/api/rooms/${inviteCode}/team-board/auto-fill?mode=${mode}`, { method: 'POST' }),
  /** 장로의 AI 캐스터 해설 (같은 배치는 서버 캐시) */
  commentary: (inviteCode: string) =>
    api<Commentary>(`/api/rooms/${inviteCode}/team-board/commentary`, { method: 'POST' }),
}

export const matchesApi = {
  list: (inviteCode: string) => api<MatchRecord[]>(`/api/rooms/${inviteCode}/matches`),
  /** 현재 보드를 스냅샷으로 기록 (10자리 모두 필요) */
  record: (inviteCode: string, body: RecordMatchRequest) =>
    api<MatchRecord>(`/api/rooms/${inviteCode}/matches`, { method: 'POST', body }),
  update: (matchId: number, body: UpdateMatchRequest) =>
    api<MatchRecord>(`/api/matches/${matchId}`, { method: 'PATCH', body }),
  remove: (matchId: number) => api<void>(`/api/matches/${matchId}`, { method: 'DELETE' }),
  ratings: (inviteCode: string) => api<Rating[]>(`/api/rooms/${inviteCode}/ratings`),
}

export const aiApi = {
  status: () => api<AiStatus>('/api/ai/status'),
}

export const hierarchyApi = {
  update: (inviteCode: string, entries: HierarchyEntry[]) =>
    api<Character[]>(`/api/rooms/${inviteCode}/hierarchy`, { method: 'PUT', body: { entries } }),
}

export const changeLogsApi = {
  list: (inviteCode: string, limit = 50) =>
    api<ChangeLog[]>(`/api/rooms/${inviteCode}/change-logs?limit=${limit}`),
}

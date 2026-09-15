import { api } from './client'
import type {
  ChangeLog,
  Character,
  CreateCharacterRequest,
  HierarchyEntry,
  Room,
  SlotRequest,
  TeamBoard,
  UpdateCharacterRequest,
} from './types'

export const roomsApi = {
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
  autoFill: (inviteCode: string) =>
    api<TeamBoard>(`/api/rooms/${inviteCode}/team-board/auto-fill`, { method: 'POST' }),
}

export const hierarchyApi = {
  update: (inviteCode: string, entries: HierarchyEntry[]) =>
    api<Character[]>(`/api/rooms/${inviteCode}/hierarchy`, { method: 'PUT', body: { entries } }),
}

export const changeLogsApi = {
  list: (inviteCode: string, limit = 50) =>
    api<ChangeLog[]>(`/api/rooms/${inviteCode}/change-logs?limit=${limit}`),
}

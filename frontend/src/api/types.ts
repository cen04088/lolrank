export const TIERS = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
] as const
export type Tier = (typeof TIERS)[number]

export const DIVISIONS = [4, 3, 2, 1] as const
export type Division = (typeof DIVISIONS)[number]

export const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const
export type Position = (typeof POSITIONS)[number]

export const HIERARCHY_RANKS = ['LEGEND', 'S', 'A', 'B', 'C'] as const
export type HierarchyRank = (typeof HIERARCHY_RANKS)[number]

export const TEAMS = ['BLUE', 'RED'] as const
export type Team = (typeof TEAMS)[number]

export type AssignmentSource = 'MANUAL' | 'AUTO'

export type BalanceGrade = 'PERFECT' | 'VERY_GOOD' | 'GOOD' | 'WARNING' | 'UNBALANCED'

export interface Room {
  id: number
  name: string
  inviteCode: string
  createdAt: string
}

export interface Character {
  id: number
  roomId: number
  name: string
  description: string | null
  assetKey: string
  tier: Tier
  division: number | null
  tierLabel: string
  mainPosition: Position
  subPosition: Position | null
  hierarchyRank: HierarchyRank
  hierarchyOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterRequest {
  name: string
  description: string | null
  assetKey: string
  tier: Tier
  division: number | null
  mainPosition: Position
  subPosition: Position | null
}

export interface UpdateCharacterRequest {
  name?: string
  description?: string
  assetKey?: string
  tier?: Tier
  division?: number
  mainPosition?: Position
  subPosition?: Position
  clearSubPosition?: boolean
}

export interface Slot {
  team: Team
  position: Position
  characterId: number | null
  source: AssignmentSource | null
}

export interface Balance {
  blueScore: number
  redScore: number
  difference: number
  grade: BalanceGrade
  message: string
  blueCount: number
  redCount: number
  blueAverageTier: string | null
  redAverageTier: string | null
}

export interface TeamBoard {
  participantIds: number[]
  slots: Slot[]
  balance: Balance
}

export interface SlotRequest {
  team: Team
  position: Position
  characterId: number | null
  source: AssignmentSource | null
}

export interface HierarchyEntry {
  characterId: number
  rank: HierarchyRank
  order: number
}

export type ChangeLogAction =
  | 'CHARACTER_CREATED'
  | 'CHARACTER_UPDATED'
  | 'CHARACTER_DELETED'
  | 'PARTICIPANTS_UPDATED'
  | 'TEAM_BOARD_UPDATED'
  | 'TEAM_BOARD_RESET'
  | 'TEAM_AUTO_FILLED'
  | 'HIERARCHY_UPDATED'

export interface ChangeLog {
  id: number
  characterId: number | null
  characterName: string | null
  nickname: string
  action: ChangeLogAction
  message: string
  createdAt: string
}

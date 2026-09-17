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

export const AUTO_FILL_MODES = ['SKILL_BALANCE', 'POSITION_BALANCE', 'RANDOM'] as const
export type AutoFillMode = (typeof AUTO_FILL_MODES)[number]

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
  /** 칭호: 이름 옆에 붙는 짧은 별칭 */
  title: string | null
  /** 주로 하는 챔피언 (쉼표 구분 자유 입력) */
  champions: string | null
  assetKey: string
  tier: Tier
  division: number | null
  tierLabel: string
  mainPosition: Position
  /** 부 포지션 (여러 개, 없으면 빈 배열) */
  subPositions: Position[]
  hierarchyRank: HierarchyRank
  hierarchyOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterRequest {
  name: string
  description: string | null
  title: string | null
  champions: string | null
  assetKey: string
  tier: Tier
  division: number | null
  mainPosition: Position
  subPositions: Position[]
}

export interface UpdateCharacterRequest {
  name?: string
  description?: string
  /** 빈 문자열을 보내면 칭호를 지운다 */
  title?: string
  /** 빈 문자열을 보내면 주 챔피언을 지운다 */
  champions?: string
  assetKey?: string
  tier?: Tier
  division?: number
  mainPosition?: Position
  /** 빈 배열을 보내면 부 포지션을 모두 지운다 */
  subPositions?: Position[]
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
  /** 팀 평균 계급도 등급 (LEGEND~C) */
  blueAverageRank: HierarchyRank | null
  redAverageRank: HierarchyRank | null
  /** 팀 평균 전투력 (0~100) = 계급도 등급 80% + 티어 20%. UI 의 TEAM POWER */
  bluePower: number
  redPower: number
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

/** GET /api/ai/status */
export interface AiStatus {
  /** 장로의 AI 캐스터 해설 사용 가능 여부 (백엔드에 DEEPSEEK_API_KEY 가 있을 때만 true) */
  commentary: boolean
  provider: string | null
  model: string | null
}

/** POST /api/rooms/{code}/team-board/commentary */
export interface Commentary {
  text: string
  boardHash: string
  cached: boolean
  model: string
  generatedAt: string
}

/** 경기(조합) 기록 — 기록 당시 스냅샷 */
export interface MatchSlot {
  team: Team
  position: Position
  characterId: number | null
  characterName: string
  title: string | null
  assetKey: string
  hierarchyRank: HierarchyRank
  tier: Tier
  division: number | null
  tierLabel: string
  /** 기록 당시 전투력 (0~100) */
  strength: number
}

export interface MatchRecord {
  id: number
  playedAt: string
  /** 승리 팀, 아직 모르면 null */
  winner: Team | null
  note: string | null
  recordedBy: string
  blueScore: number
  redScore: number
  difference: number
  grade: BalanceGrade
  slots: MatchSlot[]
}

export interface RecordMatchRequest {
  winner: Team | null
  note: string | null
}

export interface UpdateMatchRequest {
  /** null 이면 '미정' 으로 되돌린다 */
  winner: Team | null
  note?: string
}

/** GET /api/rooms/{code}/ratings — 경기 기록으로 계산한 선수별 보정치 */
export interface Rating {
  characterId: number
  characterName: string
  /** 표시 점수 (예 +3 / -2). 기본 전투력에 더해진다 */
  delta: number
  baseStrength: number
  strength: number
  played: number
  wins: number
  losses: number
  /** 0~100, 경기가 없으면 null */
  winRate: number | null
}

/**
 * 캐릭터/배경/소품 스프라이트 경로.
 *
 * - 캐릭터: Tiny Swords (Pixel Frog). 기사단 5종 × 5색 (Free Pack) + 고블린 2종 × 4색 (구버전 CC0).
 *   192/320px 프레임을 96px 로 잘라 1x 로 쓴다 → scripts/extract-tiny-swords.py
 * - 마을 배경/건물/리본: Tiny Swords 구버전 (CC0)
 * - 던전 석벽·말풍선·이모트·아이콘: Ninja Adventure (Pixel-boy & AAA, CC0) → scripts/extract-ninja-assets.py
 */
const TINY_BASE = '/assets/tiny'
const NINJA_BASE = '/assets/ninja'
const SPECIAL_BASE = '/assets/special'

export interface AssetGroup {
  id: 'knights' | 'goblins' | 'special'
  label: string
  keys: readonly string[]
}

const KNIGHT_UNITS = ['warrior', 'archer', 'lancer', 'monk', 'pawn'] as const
const KNIGHT_COLORS = ['blue', 'red', 'yellow', 'purple', 'black'] as const
const GOBLIN_UNITS = ['torch', 'tnt'] as const
const GOBLIN_COLORS = ['blue', 'red', 'yellow', 'purple'] as const

const SPECIAL_ASSETS = {
  special_fire_guardian: { file: 'fire_guardian.png', label: '안영동' },
  special_arcane_king: { file: 'arcane_king.png', label: '정재원' },
  special_jang_jiwon: { file: 'jang_jiwon.png', label: '장지원' },
  special_kim_hoyeon: { file: 'kim_hoyeon.png', label: '김호연' },
} as const

export const KNIGHT_KEYS: readonly string[] = KNIGHT_UNITS.flatMap((unit) =>
  KNIGHT_COLORS.map((color) => `ts_${unit}_${color}`),
)

export const GOBLIN_KEYS: readonly string[] = GOBLIN_UNITS.flatMap((unit) =>
  GOBLIN_COLORS.map((color) => `ts_${unit}_${color}`),
)

export const SPECIAL_KEYS: readonly string[] = Object.keys(SPECIAL_ASSETS)

export const ASSET_GROUPS: readonly AssetGroup[] = [
  { id: 'knights', label: '기사단', keys: KNIGHT_KEYS },
  { id: 'goblins', label: '고블린', keys: GOBLIN_KEYS },
  { id: 'special', label: '특수 인물', keys: SPECIAL_KEYS },
]

/** 캐릭터 선택 화면에 나오는 순서. DB 에는 이 key 가 assetKey 로 저장된다. */
export const PLAYER_ASSET_KEYS: readonly string[] = [...KNIGHT_KEYS, ...GOBLIN_KEYS, ...SPECIAL_KEYS]

const KNOWN_KEYS = new Set(PLAYER_ASSET_KEYS)

/** 계급도 구석의 조언자 NPC */
export const NPC_ELDER_KEY = 'ts_monk_yellow'

/** 예전 placeholder 키(player_01~12)로 저장된 캐릭터를 새 스프라이트에 대응시킨다. */
const LEGACY_ALIASES: Record<string, string> = {
  player_01: 'ts_warrior_blue',
  player_02: 'ts_warrior_red',
  player_03: 'ts_archer_blue',
  player_04: 'ts_archer_yellow',
  player_05: 'ts_pawn_blue',
  player_06: 'ts_torch_red',
  player_07: 'ts_tnt_purple',
  player_08: 'ts_tnt_yellow',
  player_09: 'ts_lancer_purple',
  player_10: 'ts_monk_red',
  player_11: 'ts_archer_purple',
  player_12: 'ts_torch_blue',
}

function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * DB 에 남아 있을 수 있는 알 수 없는 키(예: 예전 Ninja Adventure 키)는
 * 항상 같은 Tiny Swords 캐릭터로 대체한다.
 */
export function resolveAssetKey(assetKey: string): string {
  const aliased = LEGACY_ALIASES[assetKey] ?? assetKey
  if (KNOWN_KEYS.has(aliased)) return aliased
  return PLAYER_ASSET_KEYS[hash(assetKey) % PLAYER_ASSET_KEYS.length]
}

/** 한 프레임의 원본 픽셀 크기 */
export const SPRITE_FRAME = 96

export function spriteFrameSize(assetKey: string): number {
  return isSpecialAsset(assetKey) ? 1254 : SPRITE_FRAME
}

/** 고해상도 스프라이트는 축소 시 부드럽게 그린다. */
export function isHiResSprite(_assetKey: string): boolean {
  return true
}

export function isSpecialAsset(assetKey: string): assetKey is keyof typeof SPECIAL_ASSETS {
  return assetKey in SPECIAL_ASSETS
}

export function assetLabel(assetKey: string): string {
  return isSpecialAsset(assetKey) ? SPECIAL_ASSETS[assetKey].label : assetKey
}

function specialAssetUrl(assetKey: keyof typeof SPECIAL_ASSETS): string {
  return `${SPECIAL_BASE}/${SPECIAL_ASSETS[assetKey].file}`
}

/** 정면 대기 스프라이트 */
export function assetUrl(assetKey: string): string {
  if (isSpecialAsset(assetKey)) return specialAssetUrl(assetKey)
  return `${TINY_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}.png`
}

/** 초상화 */
export function faceUrl(assetKey: string): string {
  if (isSpecialAsset(assetKey)) return specialAssetUrl(assetKey)
  return `${TINY_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}_face.png`
}

/** 걷기 스프라이트시트 (행 = 아래/위/왼/오른, 열 = 4프레임) */
export function walkSheetUrl(assetKey: string): string {
  return `${TINY_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}_walk.png`
}

/** Ninja Adventure 16px 타일 (던전 석벽·등잔) */
export function tileUrl(name: string): string {
  return `${NINJA_BASE}/tiles/${name}.png`
}

/** Ninja Adventure UI 아이콘 (검·트로피·이모트) */
export function uiUrl(name: string): string {
  return `${NINJA_BASE}/ui/${name}.png`
}

/** Tiny Swords 64px 타일 */
export function tinyTileUrl(name: string): string {
  return `${TINY_BASE}/tiles/${name}.png`
}

/** Tiny Swords 건물/나무/장식 */
export function tinyPropUrl(name: string): string {
  return `${TINY_BASE}/props/${name}.png`
}

/** Tiny Swords 리본/배너/버튼 */
export function tinyUiUrl(name: string): string {
  return `${TINY_BASE}/ui/${name}.png`
}

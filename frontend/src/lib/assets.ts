/**
 * 캐릭터/배경/소품 스프라이트 경로.
 *
 * 두 개의 CC0 팩을 함께 쓴다.
 * - Tiny Swords (구버전, Pixel Frog): `ts_` 접두어. 192px 프레임을 96px 로 잘라 1x 로 쓴다 → scripts/extract-tiny-swords.py
 * - Ninja Adventure (Pixel-boy & AAA): 16px 스프라이트 → scripts/extract-ninja-assets.py
 */
const TINY_BASE = '/assets/tiny'
const NINJA_BASE = '/assets/ninja'

export interface AssetGroup {
  id: 'tiny' | 'ninja'
  label: string
  keys: readonly string[]
}

const TINY_UNITS = ['warrior', 'archer', 'pawn', 'torch', 'tnt', 'barrel'] as const
const TINY_COLORS = ['blue', 'red', 'yellow', 'purple'] as const

/** Tiny Swords 24종: 병종 × 색상 */
export const TINY_CHARACTER_KEYS: readonly string[] = TINY_UNITS.flatMap((unit) =>
  TINY_COLORS.map((color) => `ts_${unit}_${color}`),
)

export const NINJA_CHARACTER_KEYS: readonly string[] = [
  'ninja_blue',
  'ninja_red',
  'ninja_green',
  'ninja_yellow',
  'ninja_gray',
  'ninja_dark',
  'ninja_fire',
  'ninja_water',
  'ninja_thunder',
  'ninja_leaf',
  'ninja_masked',
  'ninja_mage_orange',
  'samurai',
  'samurai_blue',
  'samurai_red',
  'knight',
  'knight_gold',
  'gladiator_blue',
  'gladiator_red',
  'fighter_red',
  'monk',
  'hunter',
  'master',
  'princess',
  'noble',
  'boy',
  'woman',
  'villager',
  'sultan',
  'vampire',
  'skeleton',
  'tengu',
]

export const ASSET_GROUPS: readonly AssetGroup[] = [
  { id: 'tiny', label: 'Tiny Swords', keys: TINY_CHARACTER_KEYS },
  { id: 'ninja', label: 'Ninja Adventure', keys: NINJA_CHARACTER_KEYS },
]

/** 캐릭터 선택 화면에 나오는 순서. DB 에는 이 key 가 assetKey 로 저장된다. */
export const PLAYER_ASSET_KEYS: readonly string[] = [...TINY_CHARACTER_KEYS, ...NINJA_CHARACTER_KEYS]

export const NPC_ELDER_KEY = 'npc_old_man'

/** 예전 placeholder 키(player_01~12)로 저장된 캐릭터를 새 스프라이트에 대응시킨다. */
const LEGACY_ALIASES: Record<string, string> = {
  player_01: 'ts_warrior_blue',
  player_02: 'ts_warrior_red',
  player_03: 'ts_archer_blue',
  player_04: 'ts_archer_yellow',
  player_05: 'ts_pawn_blue',
  player_06: 'ts_torch_red',
  player_07: 'ts_tnt_purple',
  player_08: 'ts_barrel_yellow',
  player_09: 'ts_warrior_purple',
  player_10: 'ts_pawn_red',
  player_11: 'ts_archer_purple',
  player_12: 'ts_torch_blue',
}

export function resolveAssetKey(assetKey: string): string {
  return LEGACY_ALIASES[assetKey] ?? assetKey
}

export function isTinySwords(assetKey: string): boolean {
  return resolveAssetKey(assetKey).startsWith('ts_')
}

/** 한 프레임의 원본 픽셀 크기 (Tiny Swords 96, Ninja Adventure 16) */
export function spriteFrameSize(assetKey: string): number {
  return isTinySwords(assetKey) ? 96 : 16
}

/** 고해상도 스프라이트는 축소 시 부드럽게, 16px 도트는 항상 pixelated 로 그린다. */
export function isHiResSprite(assetKey: string): boolean {
  return isTinySwords(assetKey)
}

function charsBase(assetKey: string): string {
  return isTinySwords(assetKey) ? `${TINY_BASE}/chars` : `${NINJA_BASE}/chars`
}

/** 정면 대기 스프라이트 */
export function assetUrl(assetKey: string): string {
  const key = resolveAssetKey(assetKey)
  return `${charsBase(key)}/${encodeURIComponent(key)}.png`
}

/** 초상화 */
export function faceUrl(assetKey: string): string {
  const key = resolveAssetKey(assetKey)
  return `${charsBase(key)}/${encodeURIComponent(key)}_face.png`
}

/** 걷기 스프라이트시트 (행 = 아래/위/왼/오른, 열 = 4프레임) */
export function walkSheetUrl(assetKey: string): string {
  const key = resolveAssetKey(assetKey)
  return `${charsBase(key)}/${encodeURIComponent(key)}_walk.png`
}

/** Ninja Adventure 16px 타일 */
export function tileUrl(name: string): string {
  return `${NINJA_BASE}/tiles/${name}.png`
}

/** Ninja Adventure 소품 */
export function propUrl(name: string): string {
  return `${NINJA_BASE}/props/${name}.png`
}

/** Ninja Adventure UI 아이콘 */
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

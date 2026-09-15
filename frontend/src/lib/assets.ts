/**
 * 캐릭터/배경/소품 스프라이트 경로.
 * 그림은 Ninja Adventure Asset Pack (Pixel-boy & AAA, CC0) 에서 scripts/extract-ninja-assets.py 로 추출한다.
 */
const NINJA_BASE = '/assets/ninja'

/** 캐릭터 선택 화면에 나오는 순서. DB 에는 이 key 가 assetKey 로 저장된다. */
export const PLAYER_ASSET_KEYS: readonly string[] = [
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

export const NPC_ELDER_KEY = 'npc_old_man'

/** 예전 placeholder 키(player_01~12)로 저장된 캐릭터를 새 스프라이트에 대응시킨다. */
const LEGACY_ALIASES: Record<string, string> = {
  player_01: 'ninja_blue',
  player_02: 'ninja_red',
  player_03: 'ninja_green',
  player_04: 'ninja_yellow',
  player_05: 'samurai',
  player_06: 'knight',
  player_07: 'monk',
  player_08: 'hunter',
  player_09: 'princess',
  player_10: 'villager',
  player_11: 'samurai_blue',
  player_12: 'gladiator_blue',
}

export function resolveAssetKey(assetKey: string): string {
  return LEGACY_ALIASES[assetKey] ?? assetKey
}

/** 정면 대기 스프라이트 (16x16) */
export function assetUrl(assetKey: string): string {
  return `${NINJA_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}.png`
}

/** 초상화 (38x38) */
export function faceUrl(assetKey: string): string {
  return `${NINJA_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}_face.png`
}

/** 걷기 스프라이트시트 (64x64: 행 = 아래/위/왼/오른, 열 = 4프레임) */
export function walkSheetUrl(assetKey: string): string {
  return `${NINJA_BASE}/chars/${encodeURIComponent(resolveAssetKey(assetKey))}_walk.png`
}

export function tileUrl(name: string): string {
  return `${NINJA_BASE}/tiles/${name}.png`
}

export function propUrl(name: string): string {
  return `${NINJA_BASE}/props/${name}.png`
}

export function uiUrl(name: string): string {
  return `${NINJA_BASE}/ui/${name}.png`
}

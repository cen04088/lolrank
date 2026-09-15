export const PLAYER_ASSET_COUNT = 12

export const PLAYER_ASSET_KEYS: readonly string[] = Array.from(
  { length: PLAYER_ASSET_COUNT },
  (_, i) => `player_${String(i + 1).padStart(2, '0')}`,
)

export function assetUrl(assetKey: string): string {
  return `/assets/players/${encodeURIComponent(assetKey)}.png`
}

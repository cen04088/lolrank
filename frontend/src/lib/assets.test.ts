import { describe, expect, it } from 'vitest'
import {
  ASSET_GROUPS,
  PLAYER_ASSET_KEYS,
  SPECIAL_KEYS,
  assetLabel,
  assetUrl,
  faceUrl,
  isSpecialAsset,
  resolveAssetKey,
} from './assets'

describe('special character assets', () => {
  it('네 특수 인물을 캐릭터 선택 목록에 포함한다', () => {
    expect(SPECIAL_KEYS).toEqual(['special_fire_guardian', 'special_arcane_king', 'special_jang_jiwon', 'special_kim_hoyeon'])
    expect(PLAYER_ASSET_KEYS).toEqual(expect.arrayContaining([...SPECIAL_KEYS]))
    expect(ASSET_GROUPS.at(-1)).toMatchObject({ id: 'special', label: '특수 인물', keys: SPECIAL_KEYS })
  })

  it('특수 인물은 원본 일러스트를 전신과 얼굴에 함께 사용한다', () => {
    expect(isSpecialAsset('special_fire_guardian')).toBe(true)
    expect(resolveAssetKey('special_fire_guardian')).toBe('special_fire_guardian')
    expect(assetUrl('special_fire_guardian')).toBe('/assets/special/fire_guardian.png')
    expect(faceUrl('special_fire_guardian')).toBe('/assets/special/fire_guardian.png')
    expect(assetLabel('special_fire_guardian')).toBe('안영동')
    expect(assetLabel('special_arcane_king')).toBe('정재원')
    expect(isSpecialAsset('special_jang_jiwon')).toBe(true)
    expect(resolveAssetKey('special_jang_jiwon')).toBe('special_jang_jiwon')
    expect(assetUrl('special_jang_jiwon')).toBe('/assets/special/jang_jiwon.png')
    expect(faceUrl('special_jang_jiwon')).toBe('/assets/special/jang_jiwon.png')
    expect(assetLabel('special_jang_jiwon')).toBe('장지원')
    expect(assetUrl('special_kim_hoyeon')).toBe('/assets/special/kim_hoyeon.png')
    expect(assetLabel('special_kim_hoyeon')).toBe('김호연')
  })
})

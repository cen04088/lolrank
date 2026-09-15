import { beforeEach, describe, expect, it } from 'vitest'
import { BGM_TRACKS, DEFAULT_BGM_VOLUME, clampVolume, getBgmSettings, saveBgmSettings } from './bgm'

describe('bgm settings', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('저장된 값이 없으면 켜짐 + 기본 볼륨', () => {
    expect(getBgmSettings()).toEqual({ enabled: true, volume: DEFAULT_BGM_VOLUME })
  })

  it('일부만 저장해도 나머지는 유지되고 볼륨은 0~1 로 잘린다', () => {
    saveBgmSettings({ enabled: false })
    expect(getBgmSettings()).toEqual({ enabled: false, volume: DEFAULT_BGM_VOLUME })
    saveBgmSettings({ volume: 4 })
    expect(getBgmSettings()).toEqual({ enabled: false, volume: 1 })
  })

  it('깨진 JSON 은 기본값으로 처리한다', () => {
    window.localStorage.setItem('lolrank.bgm', '{oops')
    expect(getBgmSettings()).toEqual({ enabled: true, volume: DEFAULT_BGM_VOLUME })
  })

  it('clampVolume', () => {
    expect(clampVolume(-1)).toBe(0)
    expect(clampVolume(0.5)).toBe(0.5)
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_BGM_VOLUME)
  })

  it('화면 종류마다 트랙이 있다', () => {
    expect(Object.keys(BGM_TRACKS).sort()).toEqual(['castle', 'dungeon', 'village'])
    for (const track of Object.values(BGM_TRACKS)) {
      expect(track.src).toMatch(/^\/assets\/audio\/.+\.ogg$/)
    }
  })
})

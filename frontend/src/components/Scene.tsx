import type { CSSProperties, ReactNode } from 'react'
import { useBgmTrack } from '@/components/Bgm'
import { tinyPropUrl } from '@/lib/assets'
import './scene.css'

export type SceneKind = 'village' | 'dungeon' | 'castle'

interface SceneProps {
  kind: SceneKind
  children: ReactNode
  className?: string
}

/**
 * 화면 전체 배경 무대.
 * - village: Tiny Swords 잔디/모래 타일 + 집·탑·나무·장식 소품 (CC0)
 * - dungeon/castle: Ninja Adventure 석벽 타일 + 등잔 횃불 (CC0)
 * 외부 배경 이미지 없이 포함된 타일과 CSS 레이어만으로 그린다.
 */
export function Scene({ kind, children, className = '' }: SceneProps) {
  useBgmTrack(kind)
  return (
    <div className={`scene scene--${kind} ${className}`.trim()}>
      <div className="scene__bg" aria-hidden>
        {kind === 'village' && <VillageBackdrop />}
        {kind !== 'village' && <StoneBackdrop torches={kind === 'castle' ? 4 : 2} />}
      </div>
      <div className="scene__content">{children}</div>
    </div>
  )
}

interface VillageProp {
  name: string
  left?: string
  right?: string
  bottom: string
  /** 원본 대비 배율 (Tiny Swords 는 1x 가 기본) */
  scale?: number
}

/** 마을 뒤편 소품 (잔디 위, 콘텐츠 뒤). 좌우 대칭으로 배치. */
const VILLAGE_PROPS: VillageProp[] = [
  { name: 'house_yellow', left: '1%', bottom: '30%' },
  { name: 'tower_blue', left: '10%', bottom: '31%', scale: 0.9 },
  { name: 'tree', left: '16%', bottom: '28%' },
  { name: 'tree', left: '25%', bottom: '33%', scale: 0.75 },
  { name: 'house_purple', right: '1%', bottom: '30%' },
  { name: 'tower_red', right: '10%', bottom: '31%', scale: 0.9 },
  { name: 'tree', right: '16%', bottom: '28%' },
  { name: 'tree', right: '25%', bottom: '33%', scale: 0.75 },
  { name: 'deco_02', left: '6%', bottom: '10%' },
  { name: 'deco_05', left: '21%', bottom: '5%' },
  { name: 'sheep', left: '30%', bottom: '4%', scale: 0.8 },
  { name: 'deco_09', right: '7%', bottom: '9%' },
  { name: 'deco_12', right: '22%', bottom: '4%' },
  { name: 'deco_16', right: '31%', bottom: '2%', scale: 0.9 },
]

function VillageBackdrop() {
  return (
    <>
      <div className="scene__sky" />
      <div className="scene__cloud scene__cloud--1" />
      <div className="scene__cloud scene__cloud--2" />
      <div className="scene__cloud scene__cloud--3" />
      <svg className="scene__skyline" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <g fill="var(--stone-light)" opacity="0.55">
          <rect x="40" y="120" width="70" height="100" />
          <rect x="60" y="90" width="30" height="40" />
          <rect x="150" y="150" width="120" height="70" />
          <rect x="300" y="100" width="50" height="120" />
          <rect x="290" y="80" width="70" height="30" />
          <rect x="420" y="140" width="160" height="80" />
          <rect x="470" y="60" width="60" height="90" />
          <rect x="460" y="40" width="80" height="30" />
          <rect x="640" y="130" width="90" height="90" />
          <rect x="760" y="90" width="50" height="130" />
          <rect x="750" y="70" width="70" height="30" />
          <rect x="880" y="150" width="140" height="70" />
          <rect x="1060" y="110" width="60" height="110" />
          <rect x="1050" y="90" width="80" height="30" />
        </g>
        <g fill="var(--stone)" opacity="0.7">
          <rect x="0" y="190" width="1200" height="30" />
        </g>
      </svg>
      <div className="scene__hills" />
      <div className="scene__ground" />
      <div className="scene__path" />
      {VILLAGE_PROPS.map((prop, index) => (
        <img
          key={`${prop.name}-${index}`}
          className="scene__prop"
          src={tinyPropUrl(prop.name)}
          alt=""
          style={
            {
              left: prop.left,
              right: prop.right,
              bottom: prop.bottom,
              '--prop-scale': prop.scale ?? 1,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}

function StoneBackdrop({ torches }: { torches: number }) {
  return (
    <>
      <div className="scene__wall" />
      <div className="scene__vignette" />
      {Array.from({ length: torches }, (_, index) => (
        <div key={index} className={`torch torch--${index + 1}`}>
          <span className="torch__flame" />
          <span className="torch__glow" />
        </div>
      ))}
    </>
  )
}

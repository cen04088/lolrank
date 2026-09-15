import type { ReactNode } from 'react'
import { propUrl } from '@/lib/assets'
import './scene.css'

export type SceneKind = 'village' | 'dungeon' | 'castle'

interface SceneProps {
  kind: SceneKind
  children: ReactNode
  className?: string
}

/**
 * 화면 전체 배경 무대. Ninja Adventure 타일/소품으로 하늘·잔디·석벽을 그린다.
 * /public/assets/bg/{kind}.png 가 있으면 그 위에 덮어 그려진다 (없으면 타일 버전만 보인다).
 */
export function Scene({ kind, children, className = '' }: SceneProps) {
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

/** 마을 뒤편 소품 (잔디 위, 콘텐츠 뒤) */
const VILLAGE_PROPS: { name: string; left?: string; right?: string; bottom: string; scale?: number }[] = [
  { name: 'house_orange', left: '2%', bottom: '30%', scale: 3 },
  { name: 'tree_big', left: '15%', bottom: '31%', scale: 3 },
  { name: 'tree_pine', left: '25%', bottom: '32%', scale: 3 },
  { name: 'torii', left: '31%', bottom: '18%', scale: 3 },
  { name: 'tree_pink', right: '14%', bottom: '31%', scale: 3 },
  { name: 'house_red', right: '2%', bottom: '30%', scale: 3 },
  { name: 'tree_round', right: '24%', bottom: '31%', scale: 2 },
  { name: 'rock_gray', left: '6%', bottom: '8%', scale: 2 },
  { name: 'bush', left: '20%', bottom: '6%', scale: 3 },
  { name: 'stump', right: '8%', bottom: '10%', scale: 3 },
  { name: 'bush', right: '20%', bottom: '5%', scale: 3 },
  { name: 'rock_brown', right: '30%', bottom: '3%', scale: 2 },
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
          src={propUrl(prop.name)}
          alt=""
          style={{
            left: prop.left,
            right: prop.right,
            bottom: prop.bottom,
            ['--prop-scale' as string]: prop.scale ?? 3,
          }}
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

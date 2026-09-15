import { Link } from 'react-router-dom'
import { PixelButton } from '@/components/PixelButton'
import { Scene } from '@/components/Scene'

export function NotFoundPage() {
  return (
    <Scene kind="village">
      <main className="landing">
        <div className="logo">
          <h1 className="logo__text">404</h1>
          <p className="logo__sub">여기는 아직 개척되지 않은 맵입니다.</p>
        </div>
        <Link to="/">
          <PixelButton variant="gold" pixelFont>
            HOME
          </PixelButton>
        </Link>
      </main>
    </Scene>
  )
}

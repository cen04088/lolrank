import { Link } from 'react-router-dom'
import { PixelButton } from '@/components/PixelButton'

export function NotFoundPage() {
  return (
    <main className="home">
      <div className="home__hero">
        <h1 className="home__logo font-pixel">404</h1>
        <p className="home__tagline">여기는 아직 개척되지 않은 맵입니다.</p>
        <Link to="/">
          <PixelButton variant="gold" pixelFont>
            HOME
          </PixelButton>
        </Link>
      </div>
    </main>
  )
}

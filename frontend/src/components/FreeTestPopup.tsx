import { useNavigate } from 'react-router-dom'
import '../styles/FreeTestPopup.css'

export default function FreeTestPopup() {
  const navigate = useNavigate()

  return (
    <div className="ftpBanner" onClick={() => navigate('/test/free')}>
      <div className="ftpBannerLeft">
        <div className="ftpBannerIcon">🎯</div>
        <div>
          <p className="ftpBannerTitle">Try a Free NEET Test</p>
          <p className="ftpBannerSub">No premium needed · 180 questions · 3 hours</p>
        </div>
      </div>
      <button
        className="ftpBannerBtn"
        onClick={(e) => { e.stopPropagation(); navigate('/test/free') }}
      >
        Start Free
      </button>
    </div>
  )
}
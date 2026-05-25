import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/FreeTestPopup.css'

export default function FreeTestPopup() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <div className="ftpBanner" onClick={() => setOpen(true)}>
        <div className="ftpBannerLeft">
          <div className="ftpBannerIcon">🎯</div>
          <div>
            <p className="ftpBannerTitle">Try a Free NEET Test</p>
            <p className="ftpBannerSub">No premium needed · 180 questions · 3 hours</p>
          </div>
        </div>
        <button className="ftpBannerBtn">Start Free</button>
      </div>

      {open && (
        <div className="ftpOverlay" onClick={() => setOpen(false)}>
          <div className="ftpModal" onClick={(e) => e.stopPropagation()}>
            <button className="ftpCloseBtn" onClick={() => setOpen(false)}>×</button>

            <div className="ftpModalHeader">
              <div className="ftpModalEmoji">🎯</div>
              <h2 className="ftpModalTitle">Free NEET Full Test</h2>
              <p className="ftpModalSub">Full-length NEET pattern test — completely free</p>
            </div>

            <div className="ftpModalGrid">
              {[
                ['📋', '180 Questions', 'All subjects'],
                ['⏱️', '3 Hours', 'Real NEET duration'],
                ['📊', 'Instant Result', 'Score + analysis'],
                ['🔓', 'No Premium', 'Completely free'],
              ].map(([icon, title, sub]) => (
                <div key={title} className="ftpModalCard">
                  <div className="ftpModalCardIcon">{icon}</div>
                  <p className="ftpModalCardTitle">{title}</p>
                  <p className="ftpModalCardSub">{sub}</p>
                </div>
              ))}
            </div>

            <div className="ftpInfoRow">
              <span>✅ +4 marks correct</span>
              <span>❌ -1 mark wrong</span>
              <span>⏭ 0 skipped</span>
            </div>

            <button
              className="ftpStartBtn"
              onClick={() => { setOpen(false); navigate('/test/free') }}
            >
              Begin Free Test →
            </button>
            <p className="ftpModalNote">Free for everyone · No account needed</p>
          </div>
        </div>
      )}
    </>
  )
}
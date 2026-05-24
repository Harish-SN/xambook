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
            <p className="ftpBannerSub">No login required · 20 questions · Instant result</p>
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
              <h2 className="ftpModalTitle">Free NEET Sample Test</h2>
              <p className="ftpModalSub">20 questions across Biology, Chemistry & Physics</p>
            </div>

            <div className="ftpModalGrid">
              {[
                ['📋', '20 Questions', 'Mixed subjects'],
                ['⏱️', '25 Minutes', 'Timed test'],
                ['📊', 'Instant Result', 'Score + analysis'],
                ['🔓', 'No Login', 'Start right away'],
              ].map(([icon, title, sub]) => (
                <div key={title} className="ftpModalCard">
                  <div className="ftpModalCardIcon">{icon}</div>
                  <p className="ftpModalCardTitle">{title}</p>
                  <p className="ftpModalCardSub">{sub}</p>
                </div>
              ))}
            </div>

            <button
              className="ftpStartBtn"
              onClick={() => { setOpen(false); navigate('/test/free-sample') }}
            >
              Begin Test →
            </button>
            <p className="ftpModalNote">No account needed for this test</p>
          </div>
        </div>
      )}
    </>
  )
}

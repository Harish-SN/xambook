import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Dashboard.css'

interface User {
  id: string
  name: string
  email: string
  is_premium: boolean
  purchased_at: string | null
}

interface Attempt {
  id: number
  subject: string
  test_number: number
  score: number
  correct: number
  wrong: number
  skipped: number
  attempted_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/user/me').then(r => r.json()),
      fetch('http://localhost:8080/api/attempts/me').then(r => r.json()),
    ]).then(([userData, attemptsData]) => {
      setUser(userData)
      setAttempts(attemptsData || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="dashPage">
        <Navbar />
        <div className="dashLoading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="dashPage">
      <Navbar />

      <main className="dashMain">

        {/* Welcome */}
        <div className="dashWelcome">
          <div>
            <h1 className="dashWelcomeTitle">Welcome back, {user?.name} 👋</h1>
            <p className="dashWelcomeSub">{user?.email}</p>
          </div>
          {user?.is_premium ? (
            <div className="dashPremiumBadge">⚡ Premium Active</div>
          ) : (
            <Link to="/payment" className="dashBuyBtn">Buy Premium — ₹99</Link>
          )}
        </div>

        {/* Stats */}
        <div className="dashStatsGrid">
          {[
            { label: 'Tests Taken', value: attempts.length },
            { label: 'Avg Score', value: attempts.length ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) + '%' : 'N/A' },
            { label: 'Best Score', value: attempts.length ? Math.max(...attempts.map(a => a.score)) + '%' : 'N/A' },
            { label: 'Status', value: user?.is_premium ? 'Premium' : 'Free' },
          ].map((s) => (
            <div key={s.label} className="dashStatCard">
              <p className="dashStatValue">{s.value}</p>
              <p className="dashStatLabel">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Attempts */}
        <div className="dashSection">
          <h2 className="dashSectionTitle">Test History</h2>

          {attempts.length === 0 ? (
            <div className="dashEmpty">
              <p className="dashEmptyText">You haven't taken any tests yet.</p>
              <Link to="/courses" className="dashEmptyBtn">Browse Tests →</Link>
            </div>
          ) : (
            <div className="dashAttemptList">
              {attempts.map((a) => (
                <div key={a.id} className="dashAttemptCard">
                  <div className="dashAttemptLeft">
                    <p className="dashAttemptSubject">
                      {a.subject.charAt(0).toUpperCase() + a.subject.slice(1)} · Test {a.test_number}
                    </p>
                    <p className="dashAttemptDate">
                      {new Date(a.attempted_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="dashAttemptRight">
                    <div className="dashAttemptStats">
                      <span className="dashAttemptCorrect">✅ {a.correct}</span>
                      <span className="dashAttemptWrong">❌ {a.wrong}</span>
                      <span className="dashAttemptSkipped">⏭ {a.skipped}</span>
                    </div>
                    <div className={`dashAttemptScore ${a.score >= 60 ? 'dashAttemptScore--good' : 'dashAttemptScore--low'}`}>
                      {a.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  )
}
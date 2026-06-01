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
  marks: number
  total_marks: number
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
      fetch('https://api.xambook.com/api/user/me').then(r => r.json()),
      fetch('https://api.xambook.com/api/attempts/me').then(r => r.json()),
    ])
      .then(([userData, attemptsData]) => {
        setUser(userData)
        setAttempts(attemptsData.attempts || attemptsData || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
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

  const avgMarks = attempts.length
    ? Math.round(
        attempts.reduce((a, b) => a + b.marks, 0) / attempts.length
      )
    : null

  const bestAttempt = attempts.length
    ? attempts.reduce((best, a) =>
        a.marks > best.marks ? a : best
      )
    : null

  return (
    <div className="dashPage">
      <Navbar />

      <main className="dashMain">

        <div className="dashWelcome">
          <div>
            <h1 className="dashWelcomeTitle">
              Welcome back, {user?.name} 👋
            </h1>

            <p className="dashWelcomeSub">
              {user?.email}
            </p>
          </div>

          {user?.is_premium ? (
            <div className="dashPremiumBadge">
              ⚡ Premium Active
            </div>
          ) : (
            <Link
              to="/payment"
              className="dashBuyBtn"
            >
              Buy Premium — ₹99
            </Link>
          )}
        </div>

        <div className="dashStatsGrid">

          <div className="dashStatCard">
            <p className="dashStatValue">
              {attempts.length}
            </p>

            <p className="dashStatLabel">
              Tests Taken
            </p>
          </div>

          <div className="dashStatCard">
            <p className="dashStatValue">
              {avgMarks !== null ? avgMarks : 'N/A'}
            </p>

            <p className="dashStatLabel">
              Avg Marks
            </p>
          </div>

          <div className="dashStatCard">
            <p className="dashStatValue">
              {bestAttempt
                ? `${bestAttempt.marks}/${bestAttempt.total_marks}`
                : 'N/A'}
            </p>

            <p className="dashStatLabel">
              Best Score
            </p>
          </div>

          <div className="dashStatCard">
            <p className="dashStatValue">
              {user?.is_premium ? 'Premium' : 'Free'}
            </p>

            <p className="dashStatLabel">
              Status
            </p>
          </div>

        </div>

        <div className="dashSection">
          <h2 className="dashSectionTitle">
            Test History
          </h2>

          {attempts.length === 0 ? (
            <div className="dashEmpty">

              <p className="dashEmptyText">
                You haven't taken any tests yet.
              </p>

              <Link
                to="/courses"
                className="dashEmptyBtn"
              >
                Browse Tests →
              </Link>

            </div>
          ) : (
            <div className="dashAttemptList">

              {attempts.map((a) => (
                <div
                  key={a.id}
                  className="dashAttemptCard"
                >

                  <div className="dashAttemptLeft">

                    <p className="dashAttemptSubject">
                      {a.subject} · Test {a.test_number}
                    </p>

                    <p className="dashAttemptDate">
                      {new Date(a.attempted_at).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </p>

                  </div>

                  <div className="dashAttemptRight">

                    <div className="dashAttemptStats">

                      <span className="dashAttemptCorrect">
                        ✅ {a.correct}
                      </span>

                      <span className="dashAttemptWrong">
                        ❌ {a.wrong}
                      </span>

                      <span className="dashAttemptSkipped">
                        ⏭ {a.skipped}
                      </span>

                    </div>

                    <div className="dashAttemptScoreBox">

                      <div
                        className={`dashAttemptMarks ${
                          a.marks >= 0
                            ? 'dashAttemptMarks--good'
                            : 'dashAttemptMarks--low'
                        }`}
                      >
                        {a.marks} / {a.total_marks}
                      </div>

                      <div className="dashAttemptPct">
                        {a.score}%
                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

        <div className="dashSection">

          <h2 className="dashSectionTitle">
            Quick Links
          </h2>

          <div className="dashLinksGrid">

            <Link
              to="/courses"
              className="dashLinkCard"
            >
              <span className="dashLinkIcon">📋</span>
              <span className="dashLinkLabel">
                Test Series
              </span>
            </Link>

            <Link
              to="/test/free-test"
              className="dashLinkCard"
            >
              <span className="dashLinkIcon">🎯</span>
              <span className="dashLinkLabel">
                Free Test
              </span>
            </Link>

            <Link
              to="/about"
              className="dashLinkCard"
            >
              <span className="dashLinkIcon">ℹ️</span>
              <span className="dashLinkLabel">
                About
              </span>
            </Link>

            {!user?.is_premium && (
              <Link
                to="/payment"
                className="dashLinkCard dashLinkCard--premium"
              >
                <span className="dashLinkIcon">⚡</span>
                <span className="dashLinkLabel">
                  Go Premium
                </span>
              </Link>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Test.css'

interface Question {
  id: number
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: number
  explanation: string
  image_url: string | null
}

const TESTS = [
  { id: 1, label: 'Test 1' },
  { id: 2, label: 'Test 2' },
  { id: 3, label: 'Test 3' },
  { id: 4, label: 'Test 4' },
]

const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const

export default function Test() {
  const { subject } = useParams()
  const navigate = useNavigate()

  const isPremium = true
  const isFree = subject === 'free'

  const [selectedTest, setSelectedTest] = useState<number | null>(isFree ? 1 : null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [dark, setDark] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalMins = subject === 'mock' ? 200 : 60
  const totalMarks = subject === 'mock' ? 720 : 180

  useEffect(() => {
    if (selectedTest === null) return
    setLoading(true)
    setReady(false)
    setQuestions([])

    fetch(`http://localhost:8080/api/tests/${subject}/${selectedTest}/questions`)
      .then(r => r.json())
      .then(data => {
        setQuestions(Array.isArray(data) ? data : [])
        setAnswers({})
        setVisited(new Set())
        setCurrent(0)
        setTimeLeft(totalMins * 60)
        setSubmitted(false)
        setPaused(false)
        setLoading(false)
        setReady(true)
      })
      .catch(() => setLoading(false))
  }, [selectedTest])

  useEffect(() => {
    if (!ready || submitted || paused) return
    clearInterval(timerRef.current!)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setSubmitted(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [ready, submitted, paused])

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function selectAnswer(qIndex: number, optionIdx: number) {
    setAnswers(a => ({ ...a, [qIndex]: optionIdx }))
    setVisited(v => new Set(v).add(qIndex))
  }

  function goTo(idx: number) {
    setVisited(v => new Set(v).add(current))
    setCurrent(idx)
  }

  function handleSubmit() {
    clearInterval(timerRef.current!)
    setSubmitted(true)
  }

  function getPaletteStatus(idx: number) {
    if (answers[idx] !== undefined) return 'answered'
    if (visited.has(idx)) return 'skipped'
    return 'unattempted'
  }

  const correct = questions.filter((q, i) => answers[i] === q.correct_option).length
  const wrong = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct_option).length
  const skipped = questions.length - correct - wrong
  const marks = correct * 4 - wrong
  const percentage = questions.length > 0 ? Math.round((marks / totalMarks) * 100) : 0
  const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ''
  const isLowTime = timeLeft <= 300

  const theme = dark ? 'testDark' : 'testLight'

  // ── Result screen ──────────────────────────────────────────
  if (submitted && questions.length > 0) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />
        <div className="testThemeBar">
          <button className="testThemeBtn" onClick={() => setDark(!dark)}>
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <main className="testResultPage">
          <div className="testResultCard">
            <div className="testResultEmoji">{marks >= totalMarks * 0.6 ? '🎉' : '📚'}</div>
            <h1 className="testResultTitle">Test Complete!</h1>
            <p className="testResultSub">{subjectName} · Test {selectedTest}</p>
            <div className="testResultMarks">{marks} / {totalMarks}</div>
            <p className="testResultMarksLabel">Total Marks</p>
            <div className="testResultStatsRow">
              {[
                { val: correct, label: '✅ Correct', cls: 'testResultStatVal--correct' },
                { val: wrong, label: '❌ Wrong', cls: 'testResultStatVal--wrong' },
                { val: skipped, label: '⏭ Skipped', cls: 'testResultStatVal--skip' },
                { val: `${percentage}%`, label: 'Score', cls: 'testResultStatVal--pct' },
              ].map((s) => (
                <div key={s.label} className="testResultStat">
                  <span className={`testResultStatVal ${s.cls}`}>{s.val}</span>
                  <span className="testResultStatLabel">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="testResultBtns">
              <button className="testRetryBtn" onClick={() => {
                setSubmitted(false)
                setAnswers({})
                setVisited(new Set())
                setCurrent(0)
                setTimeLeft(totalMins * 60)
                setReady(true)
              }}>
                Retry Test
              </button>
              <button className="testBackBtn" onClick={() => navigate('/courses')}>
                Back to Tests
              </button>
            </div>
          </div>

          <div className="testExplanations">
            <h2 className="testExplTitle">Question Explanations</h2>
            {questions.map((q, i) => {
              const userAnswer = answers[i]
              const isCorrect = userAnswer === q.correct_option
              const isSkipped = userAnswer === undefined
              return (
                <div key={q.id} className={`testExplCard ${isCorrect ? 'testExplCard--correct' : isSkipped ? 'testExplCard--skipped' : 'testExplCard--wrong'}`}>
                  <div className="testExplTop">
                    <span className="testExplNum">Q{i + 1}</span>
                    <span className={`testExplStatus ${isCorrect ? 'testExplStatus--correct' : isSkipped ? 'testExplStatus--skipped' : 'testExplStatus--wrong'}`}>
                      {isCorrect ? '✅ Correct' : isSkipped ? '⏭ Skipped' : '❌ Wrong'}
                    </span>
                  </div>
                  <p className="testExplQuestion">{q.text}</p>
                  {q.image_url && <img src={q.image_url} alt="question" className="testExplImage" />}
                  <div className="testExplOptions">
                    {OPTION_KEYS.map((key, idx) => (
                      <div key={idx} className={`testExplOption ${idx === q.correct_option ? 'testExplOption--correct' : ''} ${userAnswer === idx && idx !== q.correct_option ? 'testExplOption--wrong' : ''}`}>
                        <span className="testExplOptionLabel">{String.fromCharCode(65 + idx)}</span>
                        {q[key]}
                        {idx === q.correct_option && <span className="testExplTick">✓</span>}
                        {userAnswer === idx && idx !== q.correct_option && <span className="testExplCross">✗</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="testExplBox">
                      <p className="testExplBoxTitle">Explanation</p>
                      <p className="testExplBoxText">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // ── Test picker ────────────────────────────────────────────
  if (selectedTest === null) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />
        <main className="testMain">
          <div className="testPickerHeader">
            <p className="testPickerSubject">{subjectName}</p>
            <h1 className="testPickerTitle">Select a Test</h1>
            <p className="testPickerSub">45 questions · 60 minutes · 180 marks</p>
          </div>
          <div className="testPickerGrid">
            {TESTS.map((t) => (
              <div key={t.id} className="testPickerCard">
                <div className="testPickerCardTop">
                  <span className="testPickerCardNum">Test {t.id}</span>
                  {isPremium
                    ? <span className="testPickerBadgePremium">✅ Purchased</span>
                    : <span className="testPickerBadgeLocked">🔒 Premium</span>
                  }
                </div>
                <div className="testPickerMeta">
                  <span>📋 45 Questions</span>
                  <span>⏱ 60 min</span>
                  <span>📝 180 marks</span>
                </div>
                {isPremium ? (
                  <button className="testPickerStartBtn" onClick={() => setSelectedTest(t.id)}>
                    Take Test →
                  </button>
                ) : (
                  <button className="testPickerLockedBtn" onClick={() => navigate('/payment')}>
                    Buy Premium — ₹99
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />
        <div className="testLoading">Loading questions...</div>
      </div>
    )
  }

  // ── Paused overlay ─────────────────────────────────────────
  const q = questions[current]
  const answered = Object.keys(answers).length

  return (
    <div className={`testPage ${theme}`}>
      <Navbar />

      {paused && (
        <div className="testPausedOverlay">
          <div className="testPausedBox">
            <div className="testPausedIcon">⏸</div>
            <h2 className="testPausedTitle">Test Paused</h2>
            <p className="testPausedSub">Your timer is paused. Resume when you're ready.</p>
            <button className="testPausedResumeBtn" onClick={() => setPaused(false)}>
              ▶ Resume Test
            </button>
          </div>
        </div>
      )}

      <div className="testLayout">
        <main className="testContent">
          <div className="testProgressHeader">
            <p className="testProgressCourse">{subjectName} · Test {selectedTest}</p>
            <div className="testProgressMeta">
              <span className="testProgressLabel">Q {current + 1} of {questions.length}</span>
              <span className="testProgressLabel">{answered} answered</span>
            </div>
            <div className="testProgressBar">
              <div className="testProgressFill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {q && (
            <>
              <div className="testQuestionCard">
                <p className="testQuestionNum">Q{current + 1}</p>
                <p className="testQuestionText">{q.text}</p>
                {q.image_url && <img src={q.image_url} alt="question" className="testQuestionImage" />}
              </div>
              <div className="testOptions">
                {OPTION_KEYS.map((key, idx) => {
                  const selected = answers[current] === idx
                  return (
                    <button
                      key={idx}
                      className={`testOption ${selected ? 'testOption--selected' : ''}`}
                      onClick={() => !paused && selectAnswer(current, idx)}
                    >
                      <span className={`testOptionLabel ${selected ? 'testOptionLabel--selected' : ''}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {q[key]}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="testNav">
            <button className="testPrevBtn" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}>
              ← Prev
            </button>
            {current < questions.length - 1 ? (
              <button className="testNextBtn" onClick={() => goTo(current + 1)}>Next →</button>
            ) : (
              <button className="testSubmitBtn" onClick={handleSubmit}>Submit Test ✓</button>
            )}
          </div>
        </main>

        <aside className="testSidebar">
          {/* Timer */}
          <div className={`testTimer ${isLowTime ? 'testTimer--low' : ''}`}>
            <p className="testTimerLabel">Time Left</p>
            <p className="testTimerValue">{formatTime(timeLeft)}</p>
            <button
              className={`testPauseBtn ${paused ? 'testPauseBtn--paused' : ''}`}
              onClick={() => setPaused(!paused)}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>

          {/* Theme toggle */}
          <button className="testThemeBtn" onClick={() => setDark(!dark)}>
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Legend */}
          <div className="testLegend">
            <div className="testLegendItem"><span className="testLegendDot testLegendDot--answered" /><span>Answered</span></div>
            <div className="testLegendItem"><span className="testLegendDot testLegendDot--skipped" /><span>Skipped</span></div>
            <div className="testLegendItem"><span className="testLegendDot testLegendDot--unattempted" /><span>Unattempted</span></div>
          </div>

          {/* Palette */}
          <div className="testPalette">
            {questions.map((_, idx) => {
              const status = getPaletteStatus(idx)
              return (
                <button
                  key={idx}
                  className={`testPaletteBtn testPaletteBtn--${status} ${idx === current ? 'testPaletteBtn--current' : ''}`}
                  onClick={() => goTo(idx)}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <button className="testSidebarSubmit" onClick={handleSubmit}>Submit Test ✓</button>
        </aside>
      </div>
    </div>
  )
}
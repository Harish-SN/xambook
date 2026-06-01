import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Test.css'

interface Question {
  id: number
  subject: string
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  correct_option: string
  explanation: string
  image_url: string | null
}

const TESTS = [
  { id: 1, label: 'Test 1' },
  { id: 2, label: 'Test 2' },
  { id: 3, label: 'Test 3' },
  { id: 4, label: 'Test 4' },
]

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const

export default function Test() {
  const { subject } = useParams()
  const navigate = useNavigate()

  const isPremium = true
  const isFree = subject === 'free'
  const isMock = subject === 'mock'

  const [selectedTest, setSelectedTest] = useState<number | null>(null)
  const [confirmTest, setConfirmTest] = useState<number | null>(isFree ? 1 : null)
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

  const isFullTest = isMock || isFree
  const totalMins = isFullTest ? 180 : 60
  const totalMarks = isFullTest ? 720 : 180
  const totalQuestions = isFullTest ? 180 : 45
  const durationLabel = isFullTest ? '3 hours' : '60 min'

  useEffect(() => {
    if (selectedTest === null) return

    setLoading(true)
    setReady(false)
    setQuestions([])

    fetch(`https://api.xambook.com/api/tests/${subject}/${selectedTest}/questions`)
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions || [])
        setAnswers({})
        setVisited(new Set())
        setCurrent(0)
        setTimeLeft(totalMins * 60)
        setSubmitted(false)
        setPaused(false)
        setLoading(false)
        setReady(true)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [selectedTest, subject])

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

    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

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

  function getPaletteStatus(idx: number) {
    if (answers[idx] !== undefined) return 'answered'
    if (visited.has(idx)) return 'skipped'
    return 'unattempted'
  }

  const correct = questions.filter(
    (q, i) => OPTION_KEYS[answers[i]] === q.correct_option
  ).length

  const wrong = questions.filter(
    (q, i) =>
      answers[i] !== undefined &&
      OPTION_KEYS[answers[i]] !== q.correct_option
  ).length

  const skipped = questions.length - correct - wrong
  const marks = correct * 4 - wrong

  const percentage =
    questions.length > 0
      ? Math.round((marks / totalMarks) * 100)
      : 0

  const subjectName = subject
    ? subject.charAt(0).toUpperCase() + subject.slice(1)
    : ''

  const isLowTime = timeLeft <= 300
  const theme = dark ? 'testDark' : 'testLight'

  async function saveAttempt() {
    try {
      await fetch('https://api.xambook.com/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          test_number: selectedTest,
          score: percentage,
          marks,
          total_marks: totalMarks,
          correct,
          wrong,
          skipped,
        }),
      })
    } catch (err) {
      console.error('Failed to save attempt:', err)
    }
  }

  function handleSubmit() {
    clearInterval(timerRef.current!)
    setSubmitted(true)
    saveAttempt()
  }

  if (loading) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />
        <div className="testLoading">Loading questions...</div>
      </div>
    )
  }

  const q = questions[current]
  const answered = Object.keys(answers).length

  return (
    <div className={`testPage ${theme}`}>
      <Navbar />

      <div className="testLayout">
        <main className="testContent">

          <div className="testProgressHeader">
            <p className="testProgressCourse">
              {subjectName} • Test {selectedTest}
            </p>

            <div className="testProgressMeta">
              <span className="testProgressLabel">
                Q {current + 1} of {questions.length}
              </span>

              <span className="testProgressLabel">
                {answered} answered
              </span>
            </div>

            <div className="testProgressBar">
              <div
                className="testProgressFill"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {q && (
            <>
              <div className="testQuestionCard">
                <p className="testQuestionNum">
                  Q{current + 1}
                </p>

                <p className="testQuestionText">
                  {q.question}
                </p>

                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt="question"
                    className="testQuestionImage"
                  />
                )}
              </div>

              <div className="testOptions">
                {OPTION_KEYS.map((key, idx) => {
                  const selected = answers[current] === idx

                  return (
                    <button
                      key={idx}
                      className={`testOption ${
                        selected ? 'testOption--selected' : ''
                      }`}
                      onClick={() =>
                        !paused && selectAnswer(current, idx)
                      }
                    >
                      <span
                        className={`testOptionLabel ${
                          selected
                            ? 'testOptionLabel--selected'
                            : ''
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>

                      {q.options[key]}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="testNav">
            <button
              className="testPrevBtn"
              onClick={() =>
                goTo(Math.max(0, current - 1))
              }
              disabled={current === 0}
            >
              ← Prev
            </button>

            {current < questions.length - 1 ? (
              <button
                className="testNextBtn"
                onClick={() => goTo(current + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                className="testSubmitBtn"
                onClick={handleSubmit}
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </main>

        <aside className="testSidebar">

          <div className={`testTimer ${isLowTime ? 'testTimer--low' : ''}`}>
            <p className="testTimerLabel">
              Time Left
            </p>

            <p className="testTimerValue">
              {formatTime(timeLeft)}
            </p>

            <button
              className={`testPauseBtn ${
                paused ? 'testPauseBtn--paused' : ''
              }`}
              onClick={() => setPaused(!paused)}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>

          <button
            className="testThemeBtn"
            onClick={() => setDark(!dark)}
          >
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <div className="testLegend">
            <div className="testLegendItem">
              <span className="testLegendDot testLegendDot--answered" />
              <span>Answered</span>
            </div>

            <div className="testLegendItem">
              <span className="testLegendDot testLegendDot--skipped" />
              <span>Skipped</span>
            </div>

            <div className="testLegendItem">
              <span className="testLegendDot testLegendDot--unattempted" />
              <span>Unattempted</span>
            </div>
          </div>

          <div className="testPalette">
            {questions.map((_, idx) => {
              const status = getPaletteStatus(idx)

              return (
                <button
                  key={idx}
                  className={`testPaletteBtn testPaletteBtn--${status} ${
                    idx === current
                      ? 'testPaletteBtn--current'
                      : ''
                  }`}
                  onClick={() => goTo(idx)}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <button
            className="testSidebarSubmit"
            onClick={handleSubmit}
          >
            Submit Test ✓
          </button>
        </aside>
      </div>
    </div>
  )
}
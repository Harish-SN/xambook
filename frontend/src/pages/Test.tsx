// src/pages/Test.tsx

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import Navbar from '../components/Navbar'
import MathText from '../components/MathText'

import Result, { type Question } from './Result'

import '../styles/Test.css'

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const

export default function Test() {
  const { subject } = useParams()

  const isFree = subject === 'free'
  const isMock = subject === 'mock'

  const selectedTest = 1

  const [questions, setQuestions] = useState<Question[]>([])

  const [answers, setAnswers] = useState<Record<number, string>>({})

  const [visited, setVisited] = useState<Set<number>>(new Set())

  const [current, setCurrent] = useState(0)

  const [timeLeft, setTimeLeft] = useState(0)

  const [submitted, setSubmitted] = useState(false)

  const [loading, setLoading] = useState(false)

  const [ready, setReady] = useState(false)

  // NEW: gate the test behind the instructions popup
  const [started, setStarted] = useState(false)

  const [paused, setPaused] = useState(false)

  const [dark, setDark] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const savedRef = useRef(false)

  const apiSubject = isFree
    ? 'Free Test'
    : isMock
    ? 'Full Test'
    : subject
    ? subject.charAt(0).toUpperCase() + subject.slice(1)
    : ''

  const isFullTest = isMock || isFree

  const totalMins = isFullTest ? 180 : 60

  // Dynamic total marks
  const totalMarks = questions.length * 4

  // ---------------- FETCH QUESTIONS ----------------

  useEffect(() => {
    let active = true

    setLoading(true)

    setReady(false)

    savedRef.current = false

    fetch(
      `https://api.xambook.com/api/tests/${encodeURIComponent(
        apiSubject
      )}/${selectedTest}/questions`
    )
      .then(async r => {
        if (!r.ok) {
          throw new Error('Failed to fetch questions')
        }

        return r.json()
      })

      .then((data: any) => {
        if (!active) return

        const rawQuestions = Array.isArray(data.questions)
          ? data.questions
          : []

        const qs: Question[] = rawQuestions.map((q: any) => ({
          id: q.id,

          question: q.question || q.text || '',

          options: {
            a: q.options?.a || q.option_a || '',

            b: q.options?.b || q.option_b || '',

            c: q.options?.c || q.option_c || '',

            d: q.options?.d || q.option_d || '',
          },

          correct_option: q.correct_option || '',

          explanation: q.explanation || '',

          image_url: q.image_url || '',
        }))

        console.log('Questions loaded:', qs.length)

        setQuestions(qs)

        setAnswers({})

        setVisited(new Set())

        setCurrent(0)

        setTimeLeft(totalMins * 60)

        setSubmitted(false)

        setPaused(false)

        setStarted(false) // NEW: always show instructions first

        setReady(true)
      })

      .catch(err => {
        console.error('Question fetch failed:', err)

        if (!active) return

        setQuestions([])
      })

      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [apiSubject])

  // ---------------- TIMER ----------------

  useEffect(() => {
    // NEW: don't start the clock until the user hits "Start Test"
    if (!ready || !started || submitted || paused) return

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
  }, [ready, started, submitted, paused])

  // ---------------- SAVE ATTEMPT ----------------

  useEffect(() => {
    if (!submitted || questions.length === 0 || savedRef.current) return

    savedRef.current = true

    saveAttempt()
  }, [submitted])

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600)

    const m = Math.floor((secs % 3600) / 60)

    const s = secs % 60

    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(
        2,
        '0'
      )}`
    }

    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function selectAnswer(qIndex: number, option: string) {
    setAnswers(a => ({
      ...a,
      [qIndex]: option,
    }))

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

  const correctOf = (q: Question) =>
    (q.correct_option || '').toLowerCase()

  const correct = questions.filter(
    (q, i) => answers[i] === correctOf(q)
  ).length

  const wrong = questions.filter(
    (q, i) => answers[i] !== undefined && answers[i] !== correctOf(q)
  ).length

  const skipped = questions.length - correct - wrong

  const marks = correct * 4 - wrong

  const percentage =
    totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0

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
          subject: apiSubject,

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
  }

  function startTest() {
    setStarted(true)
  }

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />

        <div className="testLoading">Loading questions...</div>
      </div>
    )
  }

  // ---------------- NO QUESTIONS ----------------

  if (!loading && questions.length === 0) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />

        <div className="testLoading">No questions found.</div>
      </div>
    )
  }

  // ---------------- INSTRUCTIONS POPUP ----------------

  if (ready && !started && !submitted && questions.length > 0) {
    return (
      <div className={`testPage ${theme}`}>
        <Navbar />

        <div className="testInstructionsOverlay">
          <div className="testInstructionsModal">
            <h2 className="testInstructionsTitle">
              {apiSubject} · Test {selectedTest}
            </h2>

            <p className="testInstructionsSub">
              Read the instructions carefully before you begin.
            </p>

            <div className="testInstructionsGrid">
              <div className="testInstructionsStat">
                <span className="testInstructionsStatValue">
                  {questions.length}
                </span>
                <span className="testInstructionsStatLabel">
                  Questions
                </span>
              </div>

              <div className="testInstructionsStat">
                <span className="testInstructionsStatValue">
                  {totalMins} min
                </span>
                <span className="testInstructionsStatLabel">
                  Duration
                </span>
              </div>

              <div className="testInstructionsStat">
                <span className="testInstructionsStatValue">
                  {totalMarks}
                </span>
                <span className="testInstructionsStatLabel">
                  Total Marks
                </span>
              </div>
            </div>

            <div className="testInstructionsMarking">
              <p className="testInstructionsMarkingTitle">
                Marking Scheme
              </p>

              <ul className="testInstructionsMarkingList">
                <li>
                  <span className="testMarkPos">+4</span> for every
                  correct answer
                </li>
                <li>
                  <span className="testMarkNeg">−1</span> for every wrong
                  answer (negative marking)
                </li>
                <li>
                  <span className="testMarkZero">0</span> for unanswered
                  questions
                </li>
              </ul>
            </div>

            {isFullTest && (
              <div className="testInstructionsSubjects">
                <p className="testInstructionsMarkingTitle">
                  Subject Distribution
                </p>

                <ul className="testInstructionsSubjectList">
                  <li>Physics — 45 questions</li>
                  <li>Chemistry — 45 questions</li>
                  <li>Botany — 45 questions</li>
                  <li>Zoology — 45 questions</li>
                </ul>
              </div>
            )}

            <p className="testInstructionsNote">
              The timer starts as soon as you begin and the test will
              auto-submit when time runs out. Make sure you are ready.
            </p>

            <button
              className="testInstructionsStartBtn"
              onClick={startTest}
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- RESULT PAGE ----------------

  if (submitted && questions.length > 0) {
    return (
      <Result
        questions={questions}
        answers={answers}
        apiSubject={apiSubject}
        selectedTest={selectedTest}
        marks={marks}
        totalMarks={totalMarks}
        correct={correct}
        wrong={wrong}
        skipped={skipped}
        percentage={percentage}
        theme={theme}
      />
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
              {apiSubject} · Test {selectedTest}
            </p>

            <div className="testProgressMeta">
              <span>
                Q {current + 1} of {questions.length}
              </span>

              <span>{answered} answered</span>
            </div>

            <div className="testProgressBar">
              <div
                className="testProgressFill"
                style={{
                  width: `${
                    ((current + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {q && (
            <>
              <div className="testQuestionCard">
                <p className="testQuestionNum">Q{current + 1}</p>

                <p className="testQuestionText">
                  <MathText text={q.question} />
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
                {OPTION_KEYS.map(key => {
                  const selected = answers[current] === key

                  return (
                    <button
                      key={key}
                      className={`testOption ${
                        selected ? 'testOption--selected' : ''
                      }`}
                      onClick={() =>
                        !paused && selectAnswer(current, key)
                      }
                    >
                      <span
                        className={`testOptionLabel ${
                          selected ? 'testOptionLabel--selected' : ''
                        }`}
                      >
                        {key.toUpperCase()}
                      </span>

                      <MathText text={q.options[key]} />
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="testNav">
            <button
              className="testPrevBtn"
              onClick={() => goTo(Math.max(0, current - 1))}
              disabled={current === 0 || paused}
            >
              ← Prev
            </button>

            <div className="testNavRight">
              {current < questions.length - 1 && (
                <button
                  className="testNextBtn"
                  onClick={() => goTo(current + 1)}
                  disabled={paused}
                >
                  Next →
                </button>
              )}

              <button
                className="testSubmitBtn"
                onClick={handleSubmit}
                disabled={paused}
              >
                Submit Test ✓
              </button>
            </div>
          </div>
        </main>

        <aside className="testSidebar">
          <div
            className={`testTimer ${
              isLowTime ? 'testTimer--low' : ''
            }`}
          >
            <p className="testTimerLabel">Time Left</p>

            <p className="testTimerValue">{formatTime(timeLeft)}</p>

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

          <div className="testPalette">
            {questions.map((_, idx) => {
              const status = getPaletteStatus(idx)

              return (
                <button
                  key={idx}
                  className={`testPaletteBtn testPaletteBtn--${status} ${
                    idx === current ? 'testPaletteBtn--current' : ''
                  }`}
                  onClick={() => goTo(idx)}
                  disabled={paused}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
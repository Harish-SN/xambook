import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Test.css'

const ALL_QUESTIONS = [
  { id: 'q1', text: 'Which of the following is the functional unit of the kidney?', options: ['Nephron', 'Neuron', 'Sarcomere', 'Acinus'], answer: 0 },
  { id: 'q2', text: 'Photosynthesis occurs in which part of the chloroplast?', options: ['Stroma', 'Thylakoid membrane', 'Outer membrane', 'Matrix'], answer: 1 },
  { id: 'q3', text: 'Which bond connects amino acids in a protein?', options: ['Glycosidic bond', 'Ester bond', 'Peptide bond', 'Hydrogen bond'], answer: 2 },
  { id: 'q4', text: 'The powerhouse of the cell is the:', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], answer: 2 },
  { id: 'q5', text: 'Which law states that genes for different traits are inherited independently?', options: ['Law of Dominance', 'Law of Segregation', 'Law of Independent Assortment', 'Hardy-Weinberg Law'], answer: 2 },
]

const TESTS = [
  { id: 1, label: 'Test 1', questions: 45, mins: 60 },
  { id: 2, label: 'Test 2', questions: 45, mins: 60 },
  { id: 3, label: 'Test 3', questions: 45, mins: 60 },
  { id: 4, label: 'Test 4', questions: 45, mins: 60 },
]

interface Result {
  score: number
  correct: number
  wrong: number
  skipped: number
}

export default function Test() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  // Replace with real auth/purchase state later
  const isPremium = true

  const [selectedTest, setSelectedTest] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<Result | null>(null)

  const QUESTIONS = ALL_QUESTIONS
  const total = QUESTIONS.length
  const answered = Object.keys(answers).length
  const q = selectedTest !== null ? QUESTIONS[current] : null

  const subjectName = courseId
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  function startTest(testId: number) {
    setSelectedTest(testId)
    setCurrent(0)
    setAnswers({})
    setResult(null)
  }

  function submit() {
    let correct = 0
    QUESTIONS.forEach((q) => { if (answers[q.id] === q.answer) correct++ })
    const wrong = answered - correct
    const skipped = total - answered
    const score = Math.max(0, Math.round(((correct * 4 - wrong) / (total * 4)) * 100))
    setResult({ score, correct, wrong, skipped })
  }

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    return (
      <div className="testPage">
        <Navbar />
        <div className="testResultMain">
          <div className="testResultEmoji">{result.score >= 60 ? '🎉' : '📚'}</div>
          <h1 className="testResultTitle">Test Complete!</h1>
          <p className="testResultSub">Here's how you did</p>

          <div className="testResultCard">
            <div className="testResultScore">{result.score}%</div>
            <p className="testResultScoreLabel">Overall Score</p>
            <div className="testResultGrid">
              {[
                { icon: '✅', label: 'Correct', val: result.correct, color: '#10b981' },
                { icon: '❌', label: 'Wrong', val: result.wrong, color: '#ef4444' },
                { icon: '⏭️', label: 'Skipped', val: result.skipped, color: '#94a3b8' },
              ].map((s) => (
                <div key={s.label} className="testResultStat">
                  <div className="testResultStatIcon">{s.icon}</div>
                  <div className="testResultStatVal" style={{ color: s.color }}>{s.val}</div>
                  <div className="testResultStatLabel">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="testResultBtns">
            <button className="testRetryBtn" onClick={() => startTest(selectedTest!)}>
              Retry Test
            </button>
            <button className="testBackBtn" onClick={() => { setSelectedTest(null); setResult(null) }}>
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Active test screen ─────────────────────────────────────
  if (selectedTest !== null && q) {
    return (
      <div className="testPage">
        <Navbar />
        <main className="testMain">
          <div className="testProgressHeader">
            <p className="testProgressCourse">
              {subjectName} · Test {selectedTest}
            </p>
            <div className="testProgressMeta">
              <span className="testProgressLabel">Question {current + 1} of {total}</span>
              <span className="testProgressLabel">{answered} answered</span>
            </div>
            <div className="testProgressBar">
              <div className="testProgressFill" style={{ width: `${((current + 1) / total) * 100}%` }} />
            </div>
          </div>

          <div className="testQuestionCard">
            <p className="testQuestionNum">Q{current + 1}</p>
            <p className="testQuestionText">{q.text}</p>
          </div>

          <div className="testOptions">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx
              return (
                <button
                  key={idx}
                  className={`testOption ${selected ? 'testOption--selected' : ''}`}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                >
                  <span className={`testOptionLabel ${selected ? 'testOptionLabel--selected' : ''}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          <div className="testNav">
            <button className="testPrevBtn" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              ← Prev
            </button>
            {current < total - 1 ? (
              <button className="testNextBtn" onClick={() => setCurrent((c) => c + 1)}>Next →</button>
            ) : (
              <button className="testSubmitBtn" onClick={submit}>Submit Test ✓</button>
            )}
          </div>
        </main>
      </div>
    )
  }

  // ── Test selection screen ──────────────────────────────────
  return (
    <div className="testPage">
      <Navbar />
      <main className="testMain">
        <div className="testPickerHeader">
          <p className="testPickerSubject">{subjectName}</p>
          <h1 className="testPickerTitle">Select a Test</h1>
          <p className="testPickerSub">4 tests · 45 questions each · 60 minutes</p>
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
                <span>📋 {t.questions} Questions</span>
                <span>⏱ {t.mins} min</span>
              </div>
              {isPremium ? (
                <button className="testPickerStartBtn" onClick={() => startTest(t.id)}>
                  Take Test →
                </button>
              ) : (
                <button className="testPickerLockedBtn" onClick={() => navigate('/login')}>
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
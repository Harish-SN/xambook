import { useState } from 'react'
import Navbar from '../components/Navbar'
import MathText from '../components/MathText'

export interface Question {
  id: number
  subject?: string
  question: string

  options: {
    a: string
    b: string
    c: string
    d: string
  }

  correct_option: string
  explanation: string
  image_url?: string | null
}

interface ResultProps {
  questions: Question[]
  answers: Record<number, string>

  apiSubject: string
  selectedTest: number

  marks: number
  totalMarks: number

  correct: number
  wrong: number
  skipped: number
  percentage: number

  theme: string
}

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const

export default function Result({
  questions,
  answers,
  apiSubject,
  selectedTest,
  marks,
  totalMarks,
  correct,
  wrong,
  skipped,
  percentage,
  theme,
}: ResultProps) {
  const [dark, setDark] = useState(
    theme === 'testDark'
  )

  const currentTheme = dark
    ? 'testDark'
    : 'testLight'

  return (
    <div className={`testPage ${currentTheme}`}>
      <Navbar />

      <div className="testThemeBar">
        <button
          className="testThemeBtn"
          onClick={() => setDark(!dark)}
        >
          {dark
            ? '☀️ Light Mode'
            : '🌙 Dark Mode'}
        </button>
      </div>

      <main className="testResultPage">
        <div className="testResultCard">
          <div className="testResultEmoji">
            {marks >= totalMarks * 0.6
              ? '🎉'
              : '📚'}
          </div>

          <h1 className="testResultTitle">
            Test Complete!
          </h1>

          <p className="testResultSub">
            {apiSubject} · Test {selectedTest}
          </p>

          <div className="testResultMarks">
            {marks} / {totalMarks}
          </div>

          <div className="testResultStatsRow">
            <div className="testResultStat">
              <span>{correct}</span>
              <p>Correct</p>
            </div>

            <div className="testResultStat">
              <span>{wrong}</span>
              <p>Wrong</p>
            </div>

            <div className="testResultStat">
              <span>{skipped}</span>
              <p>Skipped</p>
            </div>

            <div className="testResultStat">
              <span>{percentage}%</span>
              <p>Score</p>
            </div>
          </div>
        </div>

        <div className="testExplanations">
          <h2 className="testExplTitle">
            Question Explanations
          </h2>

          {questions.map((q, i) => {
            const userAnswer = answers[i]

            const correctAnswer =
              q.correct_option?.trim()?.toLowerCase()

            const isCorrect =
              userAnswer === correctAnswer

            const isSkipped =
              userAnswer === undefined

            return (
              <div
                key={q.id}
                className={`testExplCard ${
                  isCorrect
                    ? 'testExplCard--correct'
                    : isSkipped
                    ? 'testExplCard--skipped'
                    : 'testExplCard--wrong'
                }`}
              >
                <div className="testExplTop">
                  <span className="testExplNum">
                    Q{i + 1}
                  </span>

                  <span
                    className={`testExplStatus ${
                      isCorrect
                        ? 'testExplStatus--correct'
                        : isSkipped
                        ? 'testExplStatus--skipped'
                        : 'testExplStatus--wrong'
                    }`}
                  >
                    {isCorrect
                      ? '✅ Correct'
                      : isSkipped
                      ? '⏭ Skipped'
                      : '❌ Wrong'}
                  </span>
                </div>

                <p className="testExplQuestion">
                  <MathText text={q.question} />
                </p>

                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt="question"
                    className="testExplImage"
                  />
                )}

                <div className="testExplOptions">
                  {OPTION_KEYS.map(key => {
                    const isCorrectOption =
                      key === correctAnswer

                    const isUserOption =
                      userAnswer === key

                    return (
                      <div
                        key={key}
                        className={`testExplOption ${
                          isCorrectOption
                            ? 'testExplOption--correct'
                            : ''
                        } ${
                          isUserOption &&
                          !isCorrectOption
                            ? 'testExplOption--wrong'
                            : ''
                        }`}
                      >
                        <span className="testExplOptionLabel">
                          {key.toUpperCase()}
                        </span>

                        <span className="testExplOptionText">
                          <MathText
                            text={q.options[key]}
                          />
                        </span>

                        {isCorrectOption && (
                          <span className="testExplTag testExplTag--correct">
                            ✓ Correct Answer
                          </span>
                        )}

                        {isUserOption &&
                          !isCorrectOption && (
                            <span className="testExplTag testExplTag--wrong">
                              ✗ Your Answer
                            </span>
                          )}
                      </div>
                    )
                  })}
                </div>

                <div className="testExplAnswerSummary">
                  {isSkipped ? (
                    <p>
                      You skipped this question.
                    </p>
                  ) : isCorrect ? (
                    <p>
                      You answered correctly.
                    </p>
                  ) : (
                    <p>
                      Your answer:{' '}
                      <strong>
                        {userAnswer?.toUpperCase()}
                      </strong>
                    </p>
                  )}

                  <p>
                    Correct Answer:{' '}
                    <strong>
                      {correctAnswer?.toUpperCase()}
                    </strong>{' '}
                    —{' '}
                    <MathText
                      text={
                        q.options[
                          correctAnswer as keyof typeof q.options
                        ]
                      }
                    />
                  </p>
                </div>

                <div className="testExplBox">
                  <p className="testExplBoxTitle">
                    Explanation
                  </p>

                  <p className="testExplBoxText">
                    <MathText
                      text={q.explanation}
                    />
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
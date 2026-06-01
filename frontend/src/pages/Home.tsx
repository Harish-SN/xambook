import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import { Link } from 'react-router-dom'
import { useState } from 'react'

import { useAuth } from '../context/AuthContext'

import '../styles/Home.css'

const SUBJECTS = [
  {
    icon: '🌿',
    title: 'Botany',
    desc: 'Plant biology, genetics & ecology',
    color: '#10b981',
    count: 4,
  },

  {
    icon: '🐾',
    title: 'Zoology',
    desc: 'Animal kingdom, human physiology',
    color: '#4f46e5',
    count: 4,
  },

  {
    icon: '⚗️',
    title: 'Chemistry',
    desc: 'Organic, Inorganic & Physical',
    color: '#f59e0b',
    count: 4,
  },

  {
    icon: '⚡',
    title: 'Physics',
    desc: 'Mechanics, Optics & Modern Physics',
    color: '#ef4444',
    count: 4,
  },
]

const STATS = [
  {
    value: '20',
    label: 'Total Tests',
  },

  {
    value: '4',
    label: 'Subjects',
  },

  {
    value: '₹99',
    label: 'One-time Price',
  },
]

const FAQS = [
  {
    q: 'Is ₹99 a one-time payment?',

    a: 'Yes, completely. Pay once and get lifetime access to all 20 tests — no subscriptions, no hidden charges.',
  },

  {
    q: 'Which subjects and topics are covered?',

    a: 'All NEET subjects: Botany, Zoology, Physics, and Chemistry. Each has 4 subject-wise tests plus 4 full mock tests of 180 questions each.',
  },

  {
    q: 'Do I need to log in to take a test?',

    a: 'Yes. Even the free sample test requires a login so your results and progress are saved to your account.',
  },

  {
    q: 'What is the exam pattern followed?',

    a: 'All tests follow the NTA NEET pattern — 4 marks for correct, -1 for wrong, 0 for skipped.',
  },

  {
    q: 'Can I retake a test after finishing it?',

    a: 'Yes, you can retry any test as many times as you want. Your most recent score is shown on your dashboard.',
  },

  {
    q: 'Is there a free test available?',

    a: 'Yes! There is one free sample test with 180 questions covering mixed subjects. Login required to attempt it.',
  },
]

export default function Home() {
  const [openFaq, setOpenFaq] =
    useState<number | null>(null)

  const {
    authenticated,
    login,
    signup,
  } = useAuth()

  const isLoggedIn = authenticated

  // temporary
  const isPremium = false

  function handlePremiumClick(
    e: React.MouseEvent
  ) {
    if (!isLoggedIn) {
      e.preventDefault()

      login()

      return
    }

    if (!isPremium) {
      e.preventDefault()

      alert(
        'This test is only available for Premium members.'
      )
    }
  }

  return (
    <div className="homePage">
      <Navbar />

      {/* Hero */}
      <section className="homeHero">
        <div className="homeHeroBadge">
          NEET PREPARATION PLATFORM
        </div>

        <h1 className="homeHeroTitle">
          Crack NEET with
          <br />

          <span className="homeHeroAccent">
            Smart Practice
          </span>
        </h1>

        <p className="homeHeroSub">
          Subject-wise tests, full mock exams,
          and instant analysis — everything you
          need to score higher in NEET.
        </p>

        <div className="homeHeroBtns">
          <Link
            to="/courses"
            className="homeBtnPrimary"
          >
            Explore Test Series →
          </Link>

          {!isLoggedIn ? (
            <>
              <button
                onClick={() => login()}
                className="homeBtnSecondary"
              >
                Login
              </button>

              <button
                onClick={() => signup()}
                className="homeBtnOutline"
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="homeBtnSecondary"
            >
              Dashboard
            </Link>
          )}
        </div>

      </section>

      {/* Premium CTA */}
      <div className="homeCtaSection">
        <div className="homeCta">
          <div className="homePremiumBadge">
            ⚡ LIMITED OFFER
          </div>

          <h2 className="homeCtaTitle">
            Unlock Full Access
          </h2>

          <p className="homeCtaSub">
            Get all 20 test series across
            Biology, Physics & Chemistry —
            subject-wise tests + full mocks.
          </p>

          <div className="homePremiumPriceRow">
            <span className="homePremiumPrice">
              ₹99
            </span>

            <span className="homePremiumPriceNote">
              one-time · lifetime access
            </span>
          </div>

          <div className="homePremiumPerks">
            {[
              '✅ 20 subject-wise & full mock tests',
              '✅ Instant score & analysis after each test',
              '✅ NEET NTA exam pattern questions',
              '✅ Free sample test included',
            ].map(perk => (
              <p
                key={perk}
                className="homePremiumPerk"
              >
                {perk}
              </p>
            ))}
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => login()}
              className="homeCtaBtn"
            >
              Buy Premium — ₹99 →
            </button>
          ) : (
            <Link
              to="/payment"
              className="homeCtaBtn"
            >
              Buy Premium — ₹99 →
            </Link>
          )}

          <p className="homeCtaDisclaimer">
            Login required · Secure payment
          </p>
        </div>
      </div>

      {/* Subjects */}
      <section className="homeSection">
        <h2 className="homeSectionTitle">
          What we cover
        </h2>

        <p className="homeSectionSub">
          All NEET subjects with exam-pattern
          questions
        </p>

        <div className="homeSubjectGrid">
          {SUBJECTS.map(s => (
            <Link
              key={s.title}
              to="/courses"
              className="homeSubjectCard"
              onClick={handlePremiumClick}
            >
              <div className="homeSubjectIcon">
                {s.icon}
              </div>

              <h3 className="homeSubjectTitle">
                {s.title}
              </h3>

              <p className="homeSubjectDesc">
                {s.desc}
              </p>

              <div className="homeSubjectFooter">
                <span
                  className="homeSubjectCount"
                  style={{
                    color: s.color,
                  }}
                >
                  {s.count} Tests
                </span>

                <span className="homeSubjectArrow">
                  🔒 Premium
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="homeStatsBar">
        {STATS.map(s => (
          <div
            key={s.label}
            className="homeStatItem"
          >
            <span className="homeStatValue">
              {s.value}
            </span>

            <span className="homeStatLabel">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="homeSection homeFaqSection">
        <h2 className="homeSectionTitle">
          Frequently asked questions
        </h2>

        <p className="homeSectionSub">
          Everything you need to know before
          you start
        </p>

        <div className="homeFaqList">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`homeFaqItem ${
                openFaq === i
                  ? 'homeFaqItem--open'
                  : ''
              }`}
              onClick={() =>
                setOpenFaq(
                  openFaq === i ? null : i
                )
              }
            >
              <div className="homeFaqQuestion">
                <span>{faq.q}</span>

                <span className="homeFaqChevron">
                  {openFaq === i ? '▲' : '▼'}
                </span>
              </div>

              {openFaq === i && (
                <p className="homeFaqAnswer">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
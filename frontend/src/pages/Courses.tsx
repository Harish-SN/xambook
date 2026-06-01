import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import { Link, useNavigate } from 'react-router-dom'

import { useState } from 'react'

import { useAuth } from '../context/AuthContext'

import '../styles/Courses.css'

const SECTIONS = [
  {
    subject: 'Zoology',
    slug: 'zoology',
    icon: '🐾',
    color: '#4f46e5',
    bg: '#ede9fe',

    tests: [
      {
        id: 'zoo-1',
        title: 'Test 1',
        desc: 'Animal Kingdom — Classification, phylum & characteristics',
        questions: 45,
        mins: 60,
      },

      {
        id: 'zoo-2',
        title: 'Test 2',
        desc: 'Human Physiology — Digestion, circulation & excretion',
        questions: 45,
        mins: 60,
      },

      {
        id: 'zoo-3',
        title: 'Test 3',
        desc: 'Reproduction — Human reproduction & reproductive health',
        questions: 45,
        mins: 60,
      },

      {
        id: 'zoo-4',
        title: 'Test 4',
        desc: 'Genetics & Evolution — Heredity, Mendelian genetics',
        questions: 45,
        mins: 60,
      },
    ],
  },

  {
    subject: 'Botany',
    slug: 'botany',
    icon: '🌿',
    color: '#10b981',
    bg: '#d1fae5',

    tests: [
      {
        id: 'bot-1',
        title: 'Test 1',
        desc: 'Plant Kingdom — Algae, bryophytes, pteridophytes & gymnosperms',
        questions: 45,
        mins: 60,
      },

      {
        id: 'bot-2',
        title: 'Test 2',
        desc: 'Plant Physiology — Photosynthesis, respiration & transport',
        questions: 45,
        mins: 60,
      },

      {
        id: 'bot-3',
        title: 'Test 3',
        desc: 'Cell Biology — Cell structure, division & biomolecules',
        questions: 45,
        mins: 60,
      },

      {
        id: 'bot-4',
        title: 'Test 4',
        desc: 'Ecology — Ecosystems, biodiversity & environmental issues',
        questions: 45,
        mins: 60,
      },
    ],
  },

  {
    subject: 'Physics',
    slug: 'physics',
    icon: '⚡',
    color: '#ef4444',
    bg: '#fee2e2',

    tests: [
      {
        id: 'phy-1',
        title: 'Test 1',
        desc: 'Mechanics — Motion, laws of motion, gravitation & work-energy',
        questions: 45,
        mins: 60,
      },

      {
        id: 'phy-2',
        title: 'Test 2',
        desc: 'Optics & Waves — Ray optics, wave optics & oscillations',
        questions: 45,
        mins: 60,
      },

      {
        id: 'phy-3',
        title: 'Test 3',
        desc: 'Electricity & Magnetism — Current, circuits, magnetism & EMI',
        questions: 45,
        mins: 60,
      },

      {
        id: 'phy-4',
        title: 'Test 4',
        desc: 'Modern Physics — Dual nature, atoms, nuclei & semiconductors',
        questions: 45,
        mins: 60,
      },
    ],
  },

  {
    subject: 'Chemistry',
    slug: 'chemistry',
    icon: '⚗️',
    color: '#f59e0b',
    bg: '#fef3c7',

    tests: [
      {
        id: 'chem-1',
        title: 'Test 1',
        desc: 'Physical Chemistry — States of matter, thermodynamics & equilibrium',
        questions: 45,
        mins: 60,
      },

      {
        id: 'chem-2',
        title: 'Test 2',
        desc: 'Inorganic Chemistry — Periodic table, bonding & coordination compounds',
        questions: 45,
        mins: 60,
      },

      {
        id: 'chem-3',
        title: 'Test 3',
        desc: 'Organic Chemistry I — Hydrocarbons, halides & oxygen compounds',
        questions: 45,
        mins: 60,
      },

      {
        id: 'chem-4',
        title: 'Test 4',
        desc: 'Organic Chemistry II — Amines, biomolecules & polymers',
        questions: 45,
        mins: 60,
      },
    ],
  },

  {
    subject: 'Full Mocks',
    slug: 'mock',
    icon: '📋',
    color: '#8b5cf6',
    bg: '#ede9fe',

    tests: [
      {
        id: 'mock-1',
        title: 'Test 1',
        desc: '180 questions · Complete NEET pattern · All subjects',
        questions: 180,
        mins: 180,
      },

      {
        id: 'mock-2',
        title: 'Test 2',
        desc: '180 questions · Complete NEET pattern · All subjects',
        questions: 180,
        mins: 180,
      },

      {
        id: 'mock-3',
        title: 'Test 3',
        desc: '180 questions · Complete NEET pattern · All subjects',
        questions: 180,
        mins: 180,
      },

      {
        id: 'mock-4',
        title: 'Test 4',
        desc: '180 questions · Complete NEET pattern · All subjects',
        questions: 180,
        mins: 180,
      },
    ],
  },
]

export default function Courses() {
  const navigate = useNavigate()

  const { authenticated, login } =
    useAuth()

  const isLoggedIn = authenticated

  // TEMPORARY
  // Replace later with backend premium check
  const isPremium = false

  const [showPremiumPopup, setShowPremiumPopup] =
    useState(false)

  function handleAccess(
    e: React.MouseEvent
  ) {
    if (!isLoggedIn) {
      e.preventDefault()

      login()

      return
    }

    if (!isPremium) {
      e.preventDefault()

      setShowPremiumPopup(true)
    }
  }

  return (
    <div className="coursesPage">
      <Navbar />

      {/* PREMIUM POPUP */}

      {showPremiumPopup && (
        <div className="coursesPremiumOverlay">
          <div className="coursesPremiumModal">
            <div className="coursesPremiumIcon">
              🔒
            </div>

            <h2 className="coursesPremiumTitle">
              Premium Required
            </h2>

            <p className="coursesPremiumText">
              Unlock all NEET tests, full mock
              exams, instant analysis, and
              lifetime access for just ₹99.
            </p>

            <div className="coursesPremiumFeatures">
              <p>
                ✅ 20 Full Test Series
              </p>

              <p>
                ✅ 4 Full Mock Tests
              </p>

              <p>
                ✅ Subject-wise Practice
              </p>

              <p>
                ✅ Lifetime Access
              </p>
            </div>

            <div className="coursesPremiumBtns">
              <button
                className="coursesPremiumCancel"
                onClick={() =>
                  setShowPremiumPopup(false)
                }
              >
                Maybe Later
              </button>

              <button
                className="coursesPremiumBuy"
                onClick={() =>
                  navigate('/payment')
                }
              >
                Buy Premium ₹99 →
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="coursesHeader">
        <div className="coursesBadge">
          TEST SERIES
        </div>

        <h1 className="coursesHeaderTitle">
          Complete NEET Test Series
        </h1>

        <p className="coursesHeaderSub">
          20 tests across all subjects —
          subject-wise and full mocks.
        </p>
      </section>

      <main className="coursesMain">
        {SECTIONS.map(section => (
          <div
            key={section.subject}
            className="coursesSection"
          >
            <div className="coursesSectionHeader">
              <div
                className="coursesSectionIcon"
                style={{
                  background: section.bg,
                }}
              >
                {section.icon}
              </div>

              <h2 className="coursesSectionTitle">
                {section.subject}
              </h2>

              <div className="coursesSectionDivider" />

              <span className="coursesSectionCount">
                4 tests
              </span>
            </div>

            <div className="coursesGrid">
              {section.tests.map(
                (test, i) => (
                  <div
                    key={test.id}
                    className="coursesCard"
                  >
                    <div className="coursesCardTop">
                      <span
                        className="coursesCardLabel"
                        style={{
                          color:
                            section.color,
                        }}
                      >
                        TEST {i + 1}
                      </span>

                      <span className="coursesCardBadge">
                        PREMIUM
                      </span>
                    </div>

                    <h3 className="coursesCardTitle">
                      {test.title}
                    </h3>

                    <p className="coursesCardDesc">
                      {test.desc}
                    </p>

                    <div className="coursesCardMeta">
                      <span className="coursesCardMetaItem">
                        📋 {test.questions} Qs
                      </span>

                      <span className="coursesCardMetaItem">
                        ⏱ {test.mins} min
                      </span>
                    </div>

                    {isPremium ? (
                      <Link
                        to={`/test/${section.slug}`}
                        className="coursesUnlockBtn"
                      >
                        🚀 Take Test
                      </Link>
                    ) : (
                      <Link
                        to="#"
                        className="coursesUnlockBtn"
                        onClick={handleAccess}
                      >
                        🔒 Unlock
                      </Link>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}
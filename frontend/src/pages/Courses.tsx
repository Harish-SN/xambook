import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import '../styles/Courses.css'

const SECTIONS = [
  {
    subject: 'Zoology', icon: '🐾', color: '#4f46e5', bg: '#ede9fe',
    tests: [
      { id: 'zoo-1', title: 'Animal Kingdom', desc: 'Classification, phylum & characteristics', questions: 45, mins: 60 },
      { id: 'zoo-2', title: 'Human Physiology', desc: 'Digestion, circulation & excretion', questions: 45, mins: 60 },
      { id: 'zoo-3', title: 'Reproduction', desc: 'Human reproduction & reproductive health', questions: 45, mins: 60 },
      { id: 'zoo-4', title: 'Genetics & Evolution', desc: 'Heredity, Mendelian genetics & evolution', questions: 45, mins: 60 },
    ],
  },
  {
    subject: 'Botany', icon: '🌿', color: '#10b981', bg: '#d1fae5',
    tests: [
      { id: 'bot-1', title: 'Plant Kingdom', desc: 'Algae, bryophytes, pteridophytes & gymnosperms', questions: 45, mins: 60 },
      { id: 'bot-2', title: 'Plant Physiology', desc: 'Photosynthesis, respiration & transport', questions: 45, mins: 60 },
      { id: 'bot-3', title: 'Cell Biology', desc: 'Cell structure, division & biomolecules', questions: 45, mins: 60 },
      { id: 'bot-4', title: 'Ecology', desc: 'Ecosystems, biodiversity & environmental issues', questions: 45, mins: 60 },
    ],
  },
  {
    subject: 'Physics', icon: '⚡', color: '#ef4444', bg: '#fee2e2',
    tests: [
      { id: 'phy-1', title: 'Mechanics', desc: 'Motion, laws of motion, gravitation & work-energy', questions: 45, mins: 60 },
      { id: 'phy-2', title: 'Optics & Waves', desc: 'Ray optics, wave optics & oscillations', questions: 45, mins: 60 },
      { id: 'phy-3', title: 'Electricity & Magnetism', desc: 'Current, circuits, magnetism & EMI', questions: 45, mins: 60 },
      { id: 'phy-4', title: 'Modern Physics', desc: 'Dual nature, atoms, nuclei & semiconductors', questions: 45, mins: 60 },
    ],
  },
  {
    subject: 'Chemistry', icon: '⚗️', color: '#f59e0b', bg: '#fef3c7',
    tests: [
      { id: 'chem-1', title: 'Physical Chemistry', desc: 'States of matter, thermodynamics & equilibrium', questions: 45, mins: 60 },
      { id: 'chem-2', title: 'Inorganic Chemistry', desc: 'Periodic table, bonding & coordination compounds', questions: 45, mins: 60 },
      { id: 'chem-3', title: 'Organic Chemistry I', desc: 'Hydrocarbons, halides & oxygen compounds', questions: 45, mins: 60 },
      { id: 'chem-4', title: 'Organic Chemistry II', desc: 'Amines, biomolecules & polymers', questions: 45, mins: 60 },
    ],
  },
  {
    subject: 'Full Mocks', icon: '📋', color: '#8b5cf6', bg: '#ede9fe',
    tests: [
      { id: 'mock-1', title: 'Full Mock Test 1', desc: '180 questions · Complete NEET pattern', questions: 180, mins: 200 },
      { id: 'mock-2', title: 'Full Mock Test 2', desc: '180 questions · Complete NEET pattern', questions: 180, mins: 200 },
      { id: 'mock-3', title: 'Full Mock Test 3', desc: '180 questions · Complete NEET pattern', questions: 180, mins: 200 },
      { id: 'mock-4', title: 'Full Mock Test 4', desc: '180 questions · Complete NEET pattern', questions: 180, mins: 200 },
    ],
  },
]

export default function Courses() {
  return (
    <div className="coursesPage">
      <Navbar />

      <section className="coursesHeader">
        <div className="coursesBadge">TEST SERIES</div>
        <h1 className="coursesHeaderTitle">Complete NEET Test Series</h1>
        <p className="coursesHeaderSub">20 tests across all subjects — subject-wise and full mocks.</p>
      </section>

      <main className="coursesMain">
        {SECTIONS.map((section) => (
          <div key={section.subject} className="coursesSection">
            <div className="coursesSectionHeader">
              <div className="coursesSectionIcon" style={{ background: section.bg }}>
                {section.icon}
              </div>
              <h2 className="coursesSectionTitle">{section.subject}</h2>
              <div className="coursesSectionDivider" />
              <span className="coursesSectionCount">4 tests</span>
            </div>

            <div className="coursesGrid">
              {section.tests.map((test, i) => (
                <div key={test.id} className="coursesCard">
                  <div className="coursesCardTop">
                    <span className="coursesCardLabel" style={{ color: section.color }}>TEST {i + 1}</span>
                    <span className="coursesCardBadge">PREMIUM</span>
                  </div>
                  <h3 className="coursesCardTitle">{test.title}</h3>
                  <p className="coursesCardDesc">{test.desc}</p>
                  <div className="coursesCardMeta">
                    <span className="coursesCardMetaItem">📋 {test.questions} Qs</span>
                    <span className="coursesCardMetaItem">⏱ {test.mins} min</span>
                  </div>
                  <Link to={`/test/${test.id}`} className="coursesUnlockBtn">
                    🔒 Unlock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import '../styles/About.css'

export default function About() {
  return (
    <div className="aboutPage">
      <Navbar />

      <section className="aboutHero">
        <div className="aboutBadge">ABOUT US</div>
        <h1 className="aboutTitle">XamBook</h1>
        <p className="aboutSub">
          XamBook is built for NEET aspirants who want more than just reading and we give you real practice
          with exam-pattern questions and subject-level insights.
        </p>
      </section>

      <main className="aboutMain">
        <div className="aboutCards">
          {[
            { icon: '🎯', title: 'Our Mission', desc: 'Make quality NEET preparation accessible to every student, everywhere in India.' },
            { icon: '🧪', title: 'Exam Pattern', desc: 'All tests follow the exact NEET NTA pattern — marking scheme, question types and timing.' },
            { icon: '📈', title: 'Track Progress', desc: 'Know exactly where you stand — subject-wise accuracy, time taken and improvement over tests.' },
          ].map((item) => (
            <div key={item.title} className="aboutCard">
              <div className="aboutCardIcon">{item.icon}</div>
              <h3 className="aboutCardTitle">{item.title}</h3>
              <p className="aboutCardDesc">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="aboutCta">
          <h2 className="aboutCtaTitle">Start your NEET preparation with confidence</h2>
          <Link to="/courses" className="aboutCtaBtn">Explore Test Series →</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

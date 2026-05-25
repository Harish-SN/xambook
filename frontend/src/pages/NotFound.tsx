import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/NotFound.css'

export default function NotFound() {
  return (
    <div className="nfPage">
      <Navbar />
      <main className="nfMain">
        <div className="nfContent">
          <div className="nfCode">404</div>
          <h1 className="nfTitle">Page not found</h1>
          <p className="nfSub">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="nfBtns">
            <Link to="/" className="nfBtnPrimary">Go to Home</Link>
            <Link to="/courses" className="nfBtnSecondary">Browse Tests</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
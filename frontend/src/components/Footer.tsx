import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterGrid">
        <div>
          <div className="siteFooterLogoRow">
            <div className="siteFooterLogoIcon">X</div>
            <span className="siteFooterLogoText">XamBook</span>
          </div>
          <p className="siteFooterTagline">
            India's smart NEET prep platform. Practice with real exam pattern questions and track your growth.
          </p>
        </div>

        <div>
          <p className="siteFooterColTitle">Platform</p>
          {[['Test Series', '/courses'], ['About', '/about']].map(([label, to]) => (
            <Link key={label} to={to} className="siteFooterLink">{label}</Link>
          ))}
        </div>

        <div>
          <p className="siteFooterColTitle">Account</p>
          {[['Login', '/login'], ['Sign Up', '/signup']].map(([label, to]) => (
            <Link key={label} to={to} className="siteFooterLink">{label}</Link>
          ))}
        </div>
      </div>

      <div className="siteFooterBottom">
        <p className="siteFooterBottomText">© XamBook. All rights reserved.</p>
        <p className="siteFooterBottomText">Empowering NEET aspirants across India</p>
      </div>
    </footer>
  )
}
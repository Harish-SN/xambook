import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterContainer">

        <div className="siteFooterTop">

          {/* BRAND */}
          <div className="siteFooterBrand">
            <Link
              to="/"
              className="siteFooterLogoRow"
            >
              <img
                src="/logo.png"
                alt="XamBook"
                className="siteFooterLogo"
              />

              <span className="siteFooterLogoText">
                XamBook
              </span>
            </Link>

            <p className="siteFooterTagline">
              India's modern NEET preparation platform built for smart practice,
              real exam patterns, and performance tracking.
            </p>
          </div>

          {/* LINKS */}
          <div className="siteFooterLinksWrap">

            <div className="siteFooterColumn">

              <Link
                to="/courses"
                className="siteFooterLink"
              >
                Test Series
              </Link>

              <Link
                to="/dashboard"
                className="siteFooterLink"
              >
                Dashboard
              </Link>

              <Link
                to="/about"
                className="siteFooterLink"
              >
                About
              </Link>

            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="siteFooterBottom">

          <p className="siteFooterBottomText">
            © 2026 XamBook. All rights reserved.
          </p>

          <p className="siteFooterBottomText">
            Empowering NEET aspirants across India
          </p>

        </div>
      </div>
    </footer>
  )
}
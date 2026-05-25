import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        <div className="navbar__logoIcon">X</div>
        <span className="navbar__logoText">XamBook</span>
      </Link>

      <nav className="navbar__nav">
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/courses', label: 'Test Series' },
          { to: '/about', label: 'About' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`navbar__link ${pathname === to ? 'navbar__link--active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <button className="navbar__loginBtn">Login</button>
        <button className="navbar__signupBtn">Sign Up</button>
      </nav>

      <button
        className="navbar__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open1' : ''}`} />
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open2' : ''}`} />
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open3' : ''}`} />
      </button>

      {menuOpen && (
        <div className="navbar__mobileMenu">
          {[
            { to: '/courses', label: 'Test Series' },
            { to: '/about', label: 'About' },
            { to: '/dashboard', label: 'Dashboard' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar__mobileLink ${pathname === to ? 'navbar__mobileLink--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button className="navbar__mobileLoginBtn">Login</button>
          <button className="navbar__mobileLoginBtn">Sign Up</button>
        </div>
      )}
    </header>
  )
}
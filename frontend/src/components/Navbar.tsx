import { Link, useLocation } from 'react-router-dom'
import Keycloak from 'keycloak-js'
import { useState } from 'react'
import '../styles/Navbar.css'

interface Props {
  keycloak: Keycloak
}

export default function Navbar({ keycloak }: Props) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        <div className="navbar__logoIcon">X</div>
        <span className="navbar__logoText">XamBook</span>
      </Link>

      {/* Desktop nav */}
      <nav className="navbar__nav">
        {[
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

        {keycloak.authenticated ? (
          <>
            <span className="navbar__username">
              👤 {keycloak.tokenParsed?.given_name || 'Account'}
            </span>
            <button className="navbar__loginBtn" onClick={() => keycloak.logout()}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="navbar__loginBtn" onClick={() => keycloak.login()}>
              Login
            </button>
            <button className="navbar__signupBtn" onClick={() => keycloak.register()}>
              Sign Up
            </button>
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="navbar__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open1' : ''}`} />
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open2' : ''}`} />
        <span className={`navbar__bar ${menuOpen ? 'navbar__bar--open3' : ''}`} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobileMenu">
          {[
            { to: '/courses', label: 'Test Series' },
            { to: '/about', label: 'About' },
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

          {keycloak.authenticated ? (
            <button
              className="navbar__mobileLoginBtn"
              onClick={() => keycloak.logout()}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                className="navbar__mobileLoginBtn"
                onClick={() => keycloak.login()}
              >
                Login
              </button>
              <button
                className="navbar__mobileLoginBtn"
                onClick={() => keycloak.register()}
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
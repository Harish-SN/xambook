import { useState } from 'react'

import {
  Link,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import '../styles/Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const {
    authenticated,
    login,
    signup,
    logout,
    user,
    loading,
  } = useAuth()

  return (
    <header className="navbar">
      <Link
        to="/"
        className="navbar__logo"
      >
        <div className="navbar__logoIcon">
          X
        </div>

        <span className="navbar__logoText">
          XamBook
        </span>
      </Link>

      <nav className="navbar__nav">
        {[
          {
            to: '/dashboard',
            label: 'Dashboard',
          },

          {
            to: '/courses',
            label: 'Test Series',
          },

          {
            to: '/about',
            label: 'About',
          },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`navbar__link ${
              pathname === to
                ? 'navbar__link--active'
                : ''
            }`}
          >
            {label}
          </Link>
        ))}

        {loading ? (
          <div
            style={{
              width: '160px',
              height: '42px',
            }}
          />
        ) : authenticated ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: '#4f46e5',
              }}
            >
              {user?.preferred_username ||
                user?.email ||
                user?.name ||
                'User'}
            </span>

            <button
              className="navbar__loginBtn"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              className="navbar__loginBtn"
              onClick={() => login()}
            >
              Login
            </button>

            <button
              className="navbar__signupBtn"
              onClick={() => signup()}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>

      <button
        className="navbar__hamburger"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
        aria-label="Toggle menu"
      >
        <span
          className={`navbar__bar ${
            menuOpen
              ? 'navbar__bar--open1'
              : ''
          }`}
        />

        <span
          className={`navbar__bar ${
            menuOpen
              ? 'navbar__bar--open2'
              : ''
          }`}
        />

        <span
          className={`navbar__bar ${
            menuOpen
              ? 'navbar__bar--open3'
              : ''
          }`}
        />
      </button>

      {menuOpen && (
        <div className="navbar__mobileMenu">
          {[
            {
              to: '/courses',
              label: 'Test Series',
            },

            {
              to: '/about',
              label: 'About',
            },

            {
              to: '/dashboard',
              label: 'Dashboard',
            },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar__mobileLink ${
                pathname === to
                  ? 'navbar__mobileLink--active'
                  : ''
              }`}
              onClick={() =>
                setMenuOpen(false)
              }
            >
              {label}
            </Link>
          ))}

          {loading ? (
            <div
              style={{
                height: '42px',
              }}
            />
          ) : authenticated ? (
            <>
              <div
                style={{
                  padding: '12px 0',
                  fontWeight: 600,
                  color: '#4f46e5',
                }}
              >
                {user?.preferred_username ||
                  user?.email ||
                  user?.name ||
                  'User'}
              </div>

              <button
                className="navbar__mobileLoginBtn"
                onClick={() => logout()}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="navbar__mobileLoginBtn"
                onClick={() => login()}
              >
                Login
              </button>

              <button
                className="navbar__mobileLoginBtn"
                onClick={() => signup()}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
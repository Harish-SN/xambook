import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import keycloak from '../lib/keycloak'

import { AUTH_DISABLED } from '../lib/config'

type AuthContextType = {
  authenticated: boolean
  user: any
  login: () => void
  signup: () => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [authenticated, setAuthenticated] =
    useState(false)

  const [user, setUser] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    let refreshInterval: ReturnType<
      typeof setInterval
    >

    async function init() {

      // ===== LOCAL DEV MODE =====
      if (AUTH_DISABLED) {

        setAuthenticated(true)

        setUser({
          name: 'Local Dev',
          email: 'dev@localhost',
          preferred_username: 'dev',
        })

        setLoading(false)

        return
      }

      try {

        // ===== KEYCLOAK INIT =====
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',

          // IMPORTANT:
          // Prevent iframe / CSP issues in production
          checkLoginIframe: false,
        })

        setAuthenticated(auth)

        // ===== USER LOGGED IN =====
        if (auth) {

          // SAVE TOKEN
          if (keycloak.token) {

            localStorage.setItem(
              'kc_token',
              keycloak.token
            )
          }

          setUser(
            keycloak.tokenParsed
          )

          // ===== AUTO TOKEN REFRESH =====
          refreshInterval = setInterval(() => {

            keycloak
              .updateToken(60)

              .then(refreshed => {

                // UPDATE SAVED TOKEN
                if (keycloak.token) {

                  localStorage.setItem(
                    'kc_token',
                    keycloak.token
                  )
                }

                if (refreshed) {

                  console.log(
                    'Token refreshed'
                  )

                  setUser(
                    keycloak.tokenParsed
                  )
                }
              })

              .catch(err => {

                console.error(
                  'Token refresh failed',
                  err
                )

                logout()
              })

          }, 30000)
        }

        // ===== LOGIN SUCCESS =====
        keycloak.onAuthSuccess = () => {

          setAuthenticated(true)

          if (keycloak.token) {

            localStorage.setItem(
              'kc_token',
              keycloak.token
            )
          }

          setUser(
            keycloak.tokenParsed
          )
        }

        // ===== LOGOUT =====
        keycloak.onAuthLogout = () => {

          setAuthenticated(false)

          setUser(null)

          localStorage.removeItem(
            'kc_token'
          )
        }

      } catch (err) {

        console.error(
          'Keycloak init failed',
          err
        )

        setAuthenticated(false)

        setUser(null)

      } finally {

        setLoading(false)
      }
    }

    init()

    // ===== CLEANUP =====
    return () => {

      if (refreshInterval) {

        clearInterval(
          refreshInterval
        )
      }
    }

  }, [])

  // ===== LOGIN =====
  function login() {

    keycloak.login({
      redirectUri:
        window.location.origin + '/',
    })
  }

  // ===== SIGNUP =====
  function signup() {

    keycloak.register({
      redirectUri:
        window.location.origin + '/',
    })
  }

  // ===== LOGOUT =====
  function logout() {

    localStorage.removeItem(
      'kc_token'
    )

    keycloak.logout({
      redirectUri:
        window.location.origin + '/',
    })
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ===== CUSTOM HOOK =====
export function useAuth() {
  return useContext(AuthContext)
}
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
      // Local dev: skip Keycloak entirely and assume a logged-in user.
      // Pair with DEV_MODE=true on the backend.
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
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',

          checkLoginIframe: false,
        })

        setAuthenticated(auth)

        if (auth) {

          // SAVE TOKEN
          if (keycloak.token) {
            localStorage.setItem(
              'kc_token',
              keycloak.token
            )
          }

          setUser(keycloak.tokenParsed)

          // AUTO TOKEN REFRESH
          refreshInterval = setInterval(() => {
            keycloak
              .updateToken(60)
              .then(refreshed => {

                // UPDATE TOKEN
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

        keycloak.onAuthSuccess = () => {

          setAuthenticated(true)

          // SAVE TOKEN
          if (keycloak.token) {
            localStorage.setItem(
              'kc_token',
              keycloak.token
            )
          }

          setUser(keycloak.tokenParsed)
        }

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

      } finally {

        setLoading(false)

      }
    }

    init()

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  function login() {
    keycloak.login({
      redirectUri:
        window.location.origin,
    })
  }

  function signup() {
    keycloak.register({
      redirectUri:
        window.location.origin,
    })
  }

  function logout() {

    localStorage.removeItem(
      'kc_token'
    )

    keycloak.logout({
      redirectUri:
        window.location.origin,
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

export function useAuth() {
  return useContext(AuthContext)
}
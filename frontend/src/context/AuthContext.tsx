import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import keycloak from '../lib/keycloak'

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

  const [user, setUser] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let refreshInterval: ReturnType<
      typeof setInterval
    >

    async function init() {
      try {
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
        })

        setAuthenticated(auth)

        if (auth) {
          setUser(keycloak.tokenParsed)

          // AUTO TOKEN REFRESH
          refreshInterval = setInterval(() => {
            keycloak
              .updateToken(60)
              .then(refreshed => {
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

          setUser(keycloak.tokenParsed)
        }

        keycloak.onAuthLogout = () => {
          setAuthenticated(false)

          setUser(null)
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
      redirectUri: window.location.origin,
    })
  }

  function signup() {
    keycloak.register({
      redirectUri: window.location.origin,
    })
  }

  function logout() {
    keycloak.logout({
      redirectUri: window.location.origin,
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
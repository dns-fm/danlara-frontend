import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type UserOut, loginApi, logoutApi, getMeApi } from './api'

const TOKEN_KEY = 'danlara_token'

interface AuthState {
  user: UserOut | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      const storedUser = localStorage.getItem('danlara_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as UserOut)
        } catch {}
      }
      setToken(stored)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi(email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem('danlara_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) {
      try {
        await logoutApi(t)
      } catch {}
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('danlara_user')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) return
    try {
      const fresh = await getMeApi(t)
      localStorage.setItem('danlara_user', JSON.stringify(fresh))
      setUser(fresh)
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

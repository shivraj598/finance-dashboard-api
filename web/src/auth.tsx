import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { apiFetch } from "@/lib/api"
import type { Tokens, User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await apiFetch<User>("/users/me")
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
    const onExpired = () => setUser(null)
    window.addEventListener("auth:expired", onExpired)
    return () => window.removeEventListener("auth:expired", onExpired)
  }, [refreshUser])

  const login = useCallback(
    async (identifier: string, password: string) => {
      const tokens = await apiFetch<Tokens>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: identifier.trim(), password }),
      })
      localStorage.setItem("access_token", tokens.access_token)
      localStorage.setItem("refresh_token", tokens.refresh_token)
      const me = await apiFetch<User>("/users/me")
      setUser(me)
    },
    []
  )

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      await apiFetch<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      })
      // Auto sign-in with the chosen username
      await login(username, password)
    },
    [login]
  )

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    try {
      if (refreshToken) {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      }
    } catch {
      /* still clear locally */
    }
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

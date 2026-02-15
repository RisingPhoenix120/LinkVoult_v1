import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import api from "../lib/api"

export type User = {
  id: string
  email: string
  name?: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const token = localStorage.getItem("linkvault_token")
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    if (!user) {
      const cached = localStorage.getItem("linkvault_user")
      if (cached) {
        try {
          setUser(JSON.parse(cached))
        } catch (_err) {
          localStorage.removeItem("linkvault_user")
        }
      }
    }

    try {
      const res = await api.get("/api/auth/me")
      setUser(res.data)
      localStorage.setItem("linkvault_user", JSON.stringify(res.data))
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        localStorage.removeItem("linkvault_token")
        localStorage.removeItem("linkvault_user")
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password })
    localStorage.setItem("linkvault_token", res.data.token)
    setUser(res.data.user)
    localStorage.setItem("linkvault_user", JSON.stringify(res.data.user))
  }

  const register = async (email: string, password: string, name?: string) => {
    const res = await api.post("/api/auth/register", { email, password, name })
    localStorage.setItem("linkvault_token", res.data.token)
    setUser(res.data.user)
    localStorage.setItem("linkvault_user", JSON.stringify(res.data.user))
  }

  const logout = () => {
    localStorage.removeItem("linkvault_token")
    localStorage.removeItem("linkvault_user")
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

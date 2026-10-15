import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { ApiError, api } from '../lib/api'
import { clearToken, loadToken, saveToken } from '../lib/session'
import type { Me } from '../types'
import { AuthContext } from './auth'
import type { AuthState } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadToken())
  const [user, setUser] = useState<Me | null>(null)
  const [ready, setReady] = useState(false)

  // Pulihkan sesi sekali saat aplikasi dibuka.
  useEffect(() => {
    const tersimpan = loadToken()
    if (!tersimpan) {
      setReady(true)
      return
    }

    const controller = new AbortController()
    let aktif = true

    api
      .me(tersimpan, controller.signal)
      .then((res) => {
        if (!aktif) return
        setUser(res.user)
        setToken(tersimpan)
      })
      .catch((err: unknown) => {
        if (!aktif) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Token kedaluwarsa / dicabut -> bersihkan
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearToken()
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (aktif) setReady(true)
      })

    return () => {
      aktif = false
      controller.abort()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await api.register(email, password, displayName)
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
  }, [])

  const applyUser = useCallback((next: Me) => setUser(next), [])

  const value = useMemo<AuthState>(
    () => ({ user, token, ready, signIn, signUp, signOut, applyUser }),
    [user, token, ready, signIn, signUp, signOut, applyUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

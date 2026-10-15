/** Context autentikasi (tanpa JSX supaya file ini bukan komponen). */
import { createContext, useContext } from 'react'

import type { Me } from '../types'

export type AuthState = {
  /** Profil yang sedang masuk (null bila belum/tidak masuk). */
  user: Me | null
  token: string | null
  /** true bila pemeriksaan token tersimpan sudah selesai. */
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => void
  /** Perbarui profil di memori setelah disimpan ke server. */
  applyUser: (user: Me) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const state = useContext(AuthContext)
  if (!state) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return state
}

/**
 * Klien API ke Cloud Bridge.
 *
 * Semua permintaan lewat origin yang sama (Vite mem-proxy `/api`), jadi tidak
 * perlu CORS. `VITE_API_BASE` hanya diisi bila API ada di domain lain.
 */
import type {
  Device,
  DeviceSetup,
  FeedItem,
  Me,
  Paginated,
  PersonalBest,
  PublicUser,
  RaceDetail,
  RaceSummary,
} from '../types'

const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: Method
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

function parse(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null // mis. halaman HTML error dari proxy
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Tidak bisa menghubungi server. Periksa koneksi Anda.')
  }

  const data = parse(await res.text())

  if (!res.ok) {
    const pesan = (data as { error?: string } | null)?.error
    throw new ApiError(res.status, pesan ?? `Permintaan gagal (HTTP ${res.status})`)
  }
  return data as T
}

export const api = {
  // --- autentikasi -------------------------------------------------------
  login: (email: string, password: string) =>
    request<{ token: string; user: Me }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (email: string, password: string, displayName: string) =>
    request<{ token: string; user: Me }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
    }),

  me: (token: string, signal?: AbortSignal) =>
    request<{ user: Me }>('/api/me', { token, signal }),

  updateMe: (
    token: string,
    patch: { displayName?: string; bio?: string; profilePublic?: boolean },
  ) => request<{ user: Me }>('/api/me', { method: 'PATCH', body: patch, token }),

  // --- timeline & profil publik (tanpa token) ---------------------------
  feed: (opts: { limit?: number; offset?: number; signal?: AbortSignal } = {}) => {
    const params = new URLSearchParams()
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.offset) params.set('offset', String(opts.offset))
    const query = params.toString()
    return request<Paginated<FeedItem>>(`/api/feed${query ? `?${query}` : ''}`, {
      signal: opts.signal,
    })
  },

  publicUser: (id: string, signal?: AbortSignal) =>
    request<{ user: PublicUser }>(`/api/users/${encodeURIComponent(id)}`, { signal }),

  userRaces: (
    id: string,
    opts: { limit?: number; offset?: number; signal?: AbortSignal } = {},
  ) => {
    const params = new URLSearchParams()
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.offset) params.set('offset', String(opts.offset))
    const query = params.toString()
    return request<Paginated<RaceSummary>>(
      `/api/users/${encodeURIComponent(id)}/races${query ? `?${query}` : ''}`,
      { signal: opts.signal },
    )
  },

  // --- data milik sendiri ------------------------------------------------
  myRaces: (
    token: string,
    opts: { limit?: number; offset?: number; game?: string; includeLive?: boolean } = {},
  ) => {
    const params = new URLSearchParams()
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.offset) params.set('offset', String(opts.offset))
    if (opts.game) params.set('game', opts.game)
    if (opts.includeLive) params.set('includeLive', 'true')
    const query = params.toString()
    return request<Paginated<RaceSummary>>(`/api/races${query ? `?${query}` : ''}`, { token })
  },

  /** Detail satu balapan: ringkasan + daftar lap. */
  raceDetail: (token: string, id: string, signal?: AbortSignal) =>
    request<RaceDetail>(`/api/races/${encodeURIComponent(id)}`, { token, signal }),

  /** Personal best milik sendiri (per sirkuit & mobil). */
  personalBests: (token: string, signal?: AbortSignal) =>
    request<{ data: PersonalBest[] }>('/api/personal-bests', { token, signal }),

  // --- PC Bridge: alamat server & token device --------------------------
  /** Alamat server (WSS) yang harus diisi di PC Bridge + awalan token. */
  deviceSetup: (token: string, signal?: AbortSignal) =>
    request<DeviceSetup>('/api/device-setup', { token, signal }),

  /** Daftar PC yang sudah didaftarkan dengan akun ini. */
  devices: (token: string, signal?: AbortSignal) =>
    request<{ data: Device[] }>('/api/devices', { token, signal }),

  /** Daftarkan PC baru; token hanya dikembalikan SEKALI ini. */
  createDevice: (token: string, name: string) =>
    request<{ device: { id: string; name: string; createdAt: string }; token: string }>(
      '/api/devices',
      { method: 'POST', body: { name }, token },
    ),

  /** Cabut PC (token-nya langsung tidak bisa dipakai lagi). */
  revokeDevice: (token: string, id: string) =>
    request<null>(`/api/devices/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
}

/** Tipe data yang dipakai bersama seluruh aplikasi. */

/** Profil milik sendiri (dari /api/me) — termasuk email. */
export type Me = {
  id: string
  email: string
  displayName: string | null
  bio: string | null
  profilePublic: boolean
  isAdmin: boolean
  createdAt: string
}

/** Statistik ringkas seorang pembalap. */
export type UserStats = {
  sessions: number
  laps: number
  totalTimeMs: number
  bestLapMs: number | null
  topSpeedKph: number | null
  tracks: number
  games: number
  personalBests: number
  lastSessionAt: string | null
}

/** Profil publik (tanpa email). */
export type PublicUser = {
  id: string
  displayName: string
  bio: string | null
  createdAt: string | null
  stats: UserStats
}

/** Ringkasan satu sesi balapan. */
export type RaceSummary = {
  id: string
  game: string | null
  track: string | null
  car: string | null
  sessionType: string
  status: string
  startedAt: string
  endedAt: string | null
  durationMs: number | null
  totalLaps: number
  totalTimeMs: number
  bestLapMs: number | null
  bestLapNumber: number | null
  avgLapMs: number | null
  topSpeedKph: number | null
}

/** Item timeline: sesi + pemiliknya. */
export type FeedItem = RaceSummary & {
  user: { id: string; displayName: string | null }
}

export type Pagination = {
  limit: number
  offset: number
  total: number
  hasMore: boolean
}

export type Paginated<T> = {
  data: T[]
  pagination: Pagination
}

/** Satu lap di dalam detail balapan (`GET /api/races/:id`). */
export type Lap = {
  lapNumber: number
  lapTimeMs: number | null
  sector1Ms: number | null
  sector2Ms: number | null
  sector3Ms: number | null
  valid: boolean
  isBest: boolean
  topSpeedKph: number | null
  invalidReasons: string[] | null
}

export type RaceDetail = { race: RaceSummary; laps: Lap[] }

/** Personal best per sirkuit & mobil (milik user sendiri). */
export type PersonalBest = {
  game: string
  track: string
  car: string | null
  bestLapMs: number
  sessionId: string
  lapNumber: number
  achievedAt: string
}

/** Satu PC (device) yang terdaftar memakai token kita. */
export type Device = {
  id: string
  name: string
  lastSeenAt: string | null
  revokedAt: string | null
  createdAt: string
  active: boolean
}

/**
 * Info untuk mengisi PC Bridge (dari `/api/device-setup`).
 * `source: 'env'` = alamat resmi dari konfigurasi server;
 * `'derived'` = disimpulkan dari alamat website (perlu dipastikan user).
 */
export type DeviceSetup = {
  wsUrl: string
  apiBase: string
  tokenPrefix: string
  source: 'env' | 'derived'
}

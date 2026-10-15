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

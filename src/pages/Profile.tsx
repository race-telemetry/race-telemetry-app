import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import { SessionCard } from '../components/SessionCard'
import { Alert, Avatar, Badge, Button, Card, EmptyState, Spinner, StatTile } from '../components/ui'
import { ApiError, api } from '../lib/api'
import {
  displayNameOf,
  formatDate,
  formatDuration,
  formatLap,
  formatNumber,
  formatRelative,
  formatSpeed,
} from '../lib/format'
import { usePagedList } from '../lib/usePagedList'
import { useAuth } from '../state/auth'
import type { PublicUser, RaceSummary } from '../types'

const PAGE = 10
const RUANG_KOSONG: RaceSummary[] = []

export default function Profile() {
  const { id = '' } = useParams<{ id: string }>()
  const { user: saya } = useAuth()

  const [profil, setProfil] = useState<PublicUser | null>(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState<string | null>(null)
  const [tidakAda, setTidakAda] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setMemuat(true)
    setGalat(null)
    setTidakAda(false)
    setProfil(null)

    api
      .publicUser(id, controller.signal)
      .then((res) => setProfil(res.user))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof ApiError && err.status === 404) setTidakAda(true)
        else if (err instanceof ApiError) setGalat(err.message)
        else setGalat('Gagal memuat profil.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setMemuat(false)
      })

    return () => controller.abort()
  }, [id])

  // Riwayat balapan user ini (dipanggil setelah profil diketahui).
  const fetcher = useCallback(
    (offset: number, signal: AbortSignal) => {
      if (!profil) {
        return Promise.resolve({
          data: RUANG_KOSONG,
          pagination: { limit: PAGE, offset: 0, total: 0, hasMore: false },
        })
      }
      return api.userRaces(profil.id, { limit: PAGE, offset, signal })
    },
    [profil],
  )
  const riwayat = usePagedList<RaceSummary>(fetcher, profil?.id ?? '')

  if (memuat) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (tidakAda) {
    return (
      <>
        <PageHeader title="Profil tidak tersedia" />
        <EmptyState
          title="Profil tidak ditemukan atau tidak publik"
          message="Pemiliknya mungkin menonaktifkan profil publik, atau tautannya salah."
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/feed"
            className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-4 py-2.5 text-sm font-semibold text-[#E9F0F7] transition-colors hover:bg-[#243040]"
          >
            Kembali ke timeline
          </Link>
        </div>
      </>
    )
  }

  if (galat || !profil) {
    return (
      <>
        <PageHeader title="Profil" />
        <Alert tone="bad">{galat ?? 'Gagal memuat profil.'}</Alert>
      </>
    )
  }

  const stats = profil.stats
  const milikSaya = saya?.id === profil.id

  return (
    <>
      {/* ---------- kartu identitas ---------- */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={profil.displayName} size={72} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#E9F0F7]">
                {displayNameOf(profil.displayName)}
              </h1>
              {milikSaya ? <Badge tone="good">Ini Anda</Badge> : null}
            </div>

            {profil.bio ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#93A3B5]">
                {profil.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[#5F6F80]">Belum ada deskripsi.</p>
            )}

            <p className="mt-3 text-xs text-[#5F6F80]">
              Bergabung {formatDate(profil.createdAt)}
              {stats.lastSessionAt
                ? ` · balapan terakhir ${formatRelative(stats.lastSessionAt)}`
                : ' · belum ada sesi selesai'}
            </p>
          </div>

          {milikSaya ? (
            <Link
              to="/settings"
              className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-4 py-2.5 text-sm font-semibold text-[#E9F0F7] transition-colors hover:bg-[#243040]"
            >
              Edit profil
            </Link>
          ) : null}
        </div>

        {/* ---------- statistik ---------- */}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Sesi" value={formatNumber(stats.sessions)} />
          <StatTile label="Total lap" value={formatNumber(stats.laps)} />
          <StatTile label="Lap terbaik" value={formatLap(stats.bestLapMs)} accent />
          <StatTile label="Top speed" value={formatSpeed(stats.topSpeedKph)} unit="km/h" />
          <StatTile label="Sirkuit" value={formatNumber(stats.tracks)} />
          <StatTile label="Personal best" value={formatNumber(stats.personalBests)} />
        </dl>

        <p className="mt-4 text-xs text-[#5F6F80]">
          Total waktu berkendara: {formatDuration(stats.totalTimeMs)} ·{' '}
          {formatNumber(stats.games)} simulator
        </p>
      </Card>

      {/* ---------- riwayat ---------- */}
      <section className="mt-8">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
          Riwayat balapan
        </h2>

        <div className="mt-4 space-y-3">
          {riwayat.loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : riwayat.error ? (
            <Alert tone="bad">{riwayat.error}</Alert>
          ) : riwayat.items.length === 0 ? (
            <EmptyState
              title="Belum ada balapan selesai"
              message="Sesi akan muncul di sini setelah PC Bridge menutup sesinya."
            />
          ) : (
            <>
              {riwayat.items.map((race) => (
                <SessionCard key={race.id} race={race} />
              ))}

              {riwayat.hasMore ? (
                <div className="flex justify-center pt-3">
                  <Button
                    variant="secondary"
                    onClick={riwayat.loadMore}
                    disabled={riwayat.loadingMore}
                  >
                    {riwayat.loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  )
}

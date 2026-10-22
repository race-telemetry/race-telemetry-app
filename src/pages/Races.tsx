import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import { SessionCard } from '../components/SessionCard'
import { Alert, EmptyState, Spinner } from '../components/ui'
import { api } from '../lib/api'
import { gameLabel } from '../lib/format'
import { usePagedList } from '../lib/usePagedList'
import { useAuth } from '../state/auth'
import type { RaceSummary } from '../types'

type FilterStatus = '' | 'finished' | 'live' | 'abandoned'

export default function Races() {
  const { token } = useAuth()
  const [game, setGame] = useState('')
  const [status, setStatus] = useState<FilterStatus>('')

  const daftar = usePagedList<RaceSummary>(
    (offset, _signal) => {
      if (!token) {
        return Promise.resolve({
          data: [],
          pagination: { limit: 20, offset, total: 0, hasMore: false },
        })
      }
      return api.myRaces(token, { limit: 20, offset, game: game || undefined, includeLive: true })
    },
    `races:${game}:${token ?? ''}`,
  )

  // Filter status diterapkan di sisi klien (server hanya menyaring game).
  const tampil = daftar.items.filter((r) => (status ? r.status === status : true))
  const pilihanGame = useMemo(
    () =>
      Array.from(
        new Set(daftar.items.map((r) => r.game).filter((g): g is string => Boolean(g))),
      ).sort(),
    [daftar.items],
  )

  return (
    <>
      <PageHeader
        title="Balapan"
        subtitle="Riwayat balapan milik Anda — termasuk sesi yang sedang berjalan."
      />

      {daftar.error ? (
        <div className="mb-4">
          <Alert tone="bad">{daftar.error}</Alert>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.12em] text-[#93A3B5] uppercase">
            Game
          </span>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-3 py-2 text-sm text-[#E9F0F7] outline-none focus:border-[#19E3B1]"
          >
            <option value="">Semua game</option>
            {pilihanGame.map((g) => (
              <option key={g} value={g}>
                {gameLabel(g)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.12em] text-[#93A3B5] uppercase">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-3 py-2 text-sm text-[#E9F0F7] outline-none focus:border-[#19E3B1]"
          >
            <option value="">Semua status</option>
            <option value="finished">Selesai</option>
            <option value="live">Sedang berjalan</option>
            <option value="abandoned">Terhenti</option>
          </select>
        </label>

        <span className="ml-auto text-xs text-[#5F6F80]">
          {daftar.loading ? 'Memuat…' : `${daftar.total} balapan`}
        </span>
      </div>

      {daftar.loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : tampil.length === 0 ? (
        <EmptyState
          title="Belum ada balapan"
          message="Jalankan PC Bridge, masuk sebagai pembalap, lalu mulai sesi di game — balapan Anda akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {tampil.map((race) => (
            <Link
              key={race.id}
              to={`/races/${race.id}`}
              className="block transition-transform hover:translate-y-[-1px]"
            >
              <SessionCard race={race} />
            </Link>
          ))}
        </div>
      )}

      {!daftar.loading && daftar.hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={daftar.loadMore}
            disabled={daftar.loadingMore}
            className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-5 py-2.5 text-sm font-semibold text-[#E9F0F7] transition-colors hover:bg-[#243040] disabled:opacity-50"
          >
            {daftar.loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
          </button>
        </div>
      ) : null}

      <p className="mt-6 text-[11px] leading-relaxed text-[#5F6F80]">
        Klik salah satu balapan untuk melihat rincian lap, sektor, dan analitiknya.
        Sesi yang terhenti (PC mati di tengah jalan) tetap tampil dengan status
        “Terhenti”.
      </p>
    </>
  )
}

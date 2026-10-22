import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import { Alert, EmptyState, Spinner, StatTile } from '../components/ui'
import { api } from '../lib/api'
import { formatDate, formatLap, gameLabel, trackLabel } from '../lib/format'
import { useAuth } from '../state/auth'
import type { PersonalBest } from '../types'

export default function PersonalBests() {
  const { token } = useAuth()
  const [items, setItems] = useState<PersonalBest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState('')

  const muat = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.personalBests(token)
      setItems(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat personal best.')
    }
  }, [token])

  useEffect(() => {
    void muat()
  }, [muat])

  const tampil = useMemo(
    () => (items ?? []).filter((p) => (game ? p.game === game : true)),
    [items, game],
  )
  const pilihanGame = useMemo(
    () => Array.from(new Set((items ?? []).map((p) => p.game))).sort(),
    [items],
  )

  return (
    <>
      <PageHeader
        title="Personal Best"
        subtitle="Rekor lap terbaik Anda per sirkuit & mobil — divalidasi oleh server."
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="bad">{error}</Alert>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Total PB" value={String(items?.length ?? 0)} />
        <StatTile
          label="Sirkuit"
          value={String(new Set((items ?? []).map((p) => p.track)).size)}
        />
        <StatTile label="Game" value={String(pilihanGame.length)} />
      </div>

      {pilihanGame.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-end gap-3">
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
        </div>
      ) : null}

      {items === null && !error ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : tampil.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Belum ada personal best"
            message="Selesaikan sesi balapan lewat PC Bridge — rekor lap terbaik Anda akan muncul di sini."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#2A3746]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2A3746] bg-[#141B24] text-[10px] tracking-[0.12em] text-[#5F6F80] uppercase">
                <th className="px-4 py-3">Sirkuit</th>
                <th className="px-4 py-3">Mobil</th>
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Lap terbaik</th>
                <th className="px-4 py-3">Di lap</th>
                <th className="px-4 py-3">Dicapai</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3746]">
              {tampil.map((pb) => (
                <tr key={`${pb.game}-${pb.track}-${pb.car ?? ''}`} className="hover:bg-[#1D2733]/60">
                  <td className="px-4 py-3 font-semibold text-[#E9F0F7]">{trackLabel(pb.track)}</td>
                  <td className="px-4 py-3 text-[#93A3B5]">{pb.car ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg border border-[#2A3746] px-2 py-0.5 text-[11px] text-[#93A3B5]">
                      {gameLabel(pb.game)}
                    </span>
                  </td>
                  <td className="mono px-4 py-3 font-bold text-[#19E3B1]">{formatLap(pb.bestLapMs)}</td>
                  <td className="mono px-4 py-3 text-[#93A3B5]">lap {pb.lapNumber}</td>
                  <td className="px-4 py-3 text-[#93A3B5]">{formatDate(pb.achievedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/races/${pb.sessionId}`}
                      className="text-xs font-semibold text-[#19E3B1] hover:underline"
                    >
                      Lihat balapan
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-[#5F6F80]">
        Personal best dihitung server dari lap yang sah — angka dari client tidak
        dipercaya mentah. Lap tidak sah (mis. off-track) tidak pernah menjadi rekor.
      </p>
    </>
  )
}

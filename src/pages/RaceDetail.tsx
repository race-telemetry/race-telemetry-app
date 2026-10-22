import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LapChart, ConsistencyMeter } from '../components/charts'
import { PageHeader } from '../components/Layout'
import { Alert, Badge, Card, SectionTitle, Spinner, StatTile } from '../components/ui'
import { api } from '../lib/api'
import {
  formatDuration,
  formatLap,
  formatSpeed,
  gameLabel,
  trackLabel,
} from '../lib/format'
import { useAuth } from '../state/auth'
import type { RaceDetail } from '../types'

export default function RaceDetail() {
  const { id = '' } = useParams()
  const { token } = useAuth()
  const [data, setData] = useState<RaceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const muat = useCallback(async () => {
    if (!token || !id) return
    setLoading(true)
    setError(null)
    try {
      setData(await api.raceDetail(token, id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat balapan.')
    } finally {
      setLoading(false)
    }
  }, [token, id])

  useEffect(() => {
    void muat()
  }, [muat])

  const race = data?.race
  const laps = data?.laps ?? []
  const lapBerwaktu = laps.filter((l) => typeof l.lapTimeMs === 'number' && l.lapTimeMs > 0)
  const lapSah = lapBerwaktu.filter((l) => l.valid)

  return (
    <>
      <PageHeader
        title={race ? trackLabel(race.track) : 'Detail Balapan'}
        subtitle={race ? `${gameLabel(race.game)} · ${race.sessionType}` : 'Memuat…'}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error || !race ? (
        <div className="space-y-4">
          <Alert tone="bad">{error ?? 'Balapan tidak ditemukan.'}</Alert>
          <Link to="/races" className="text-sm text-[#19E3B1] hover:underline">
            ← Kembali ke daftar balapan
          </Link>
        </div>
      ) : (
        <>
          {race.status !== 'finished' ? (
            <div className="mb-5">
              <Alert tone="warn">
                Sesi ini berstatus{' '}
                {race.status === 'live' ? 'sedang berjalan' : 'terhenti'} — rincian di
                bawah bisa berubah.
              </Alert>
            </div>
          ) : null}

          {/* --- ringkasan --- */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Lap" value={String(race.totalLaps)} />
            <StatTile label="Lap terbaik" value={formatLap(race.bestLapMs)} accent />
            <StatTile label="Rata-rata" value={formatLap(race.avgLapMs)} />
            <StatTile label="Top speed" value={formatSpeed(race.topSpeedKph)} unit="km/h" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <Info label="Status" value={race.status} />
            <Info label="Durasi" value={formatDuration(race.durationMs)} />
            <Info label="Mulai" value={race.startedAt} />
            <Info label="Selesai" value={race.endedAt ?? '—'} />
          </div>

          {/* --- grafik lap --- */}
          <Card className="mt-6 p-6">
            <SectionTitle
              title="Tren waktu lap"
              subtitle="Titik hijau = lap sah, merah = lap tidak sah. Garis putus-putus = lap terbaik."
            />
            <div className="mt-4">
              <LapChart laps={laps} />
            </div>
            <div className="mt-5">
              <ConsistencyMeter valid={lapSah.length} total={lapBerwaktu.length} />
            </div>
          </Card>

          {/* --- tabel lap --- */}
          <Card className="mt-6 p-6">
            <SectionTitle title="Daftar lap" subtitle="Urut dari lap pertama." />
            {laps.length === 0 ? (
              <p className="mt-4 text-xs text-[#5F6F80]">
                Belum ada lap yang terekam pada sesi ini.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#2A3746] text-[10px] tracking-[0.12em] text-[#5F6F80] uppercase">
                      <th className="py-2 pr-4">Lap</th>
                      <th className="py-2 pr-4">Waktu</th>
                      <th className="py-2 pr-4">S1</th>
                      <th className="py-2 pr-4">S2</th>
                      <th className="py-2 pr-4">S3</th>
                      <th className="py-2 pr-4">Top speed</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3746]">
                    {laps.map((l) => (
                      <tr key={l.lapNumber} className={l.isBest ? 'bg-[#19E3B1]/5' : ''}>
                        <td className="py-2 pr-4 font-semibold text-[#E9F0F7]">{l.lapNumber}</td>
                        <td className="mono py-2 pr-4 text-[#E9F0F7]">{formatLap(l.lapTimeMs)}</td>
                        <td className="mono py-2 pr-4 text-[#93A3B5]">{formatLap(l.sector1Ms)}</td>
                        <td className="mono py-2 pr-4 text-[#93A3B5]">{formatLap(l.sector2Ms)}</td>
                        <td className="mono py-2 pr-4 text-[#93A3B5]">{formatLap(l.sector3Ms)}</td>
                        <td className="mono py-2 pr-4 text-[#93A3B5]">
                          {formatSpeed(l.topSpeedKph)}
                        </td>
                        <td className="py-2">
                          {l.valid ? (
                            <Badge tone={l.isBest ? 'good' : 'neutral'}>
                              {l.isBest ? 'Terbaik' : 'Sah'}
                            </Badge>
                          ) : (
                            <Badge tone="bad">
                              Invalid{l.invalidReasons?.length ? `: ${l.invalidReasons[0]}` : ''}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Link to="/races" className="mt-6 inline-block text-sm text-[#19E3B1] hover:underline">
            ← Kembali ke daftar balapan
          </Link>
        </>
      )}
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2A3746] bg-[#141B24] px-3 py-2">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-[#5F6F80] uppercase">
        {label}
      </p>
      <p className="mono mt-0.5 truncate text-xs text-[#93A3B5]">{value}</p>
    </div>
  )
}

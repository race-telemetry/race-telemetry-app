/**
 * Grafik SVG ringan untuk halaman Balapan & Detail Race.
 *
 * Sengaja tanpa library chart: bundle tetap kecil, dan tampilannya konsisten
 * dengan tema racing gelap proyek ini (aksen mint, grid abu-abu).
 */
import { formatLap } from '../lib/format'
import type { Lap } from '../types'

type Titik = { lap: number; ms: number; valid: boolean; isBest: boolean }

const GRID = '#2A3746'
const AKSEN = '#19E3B1'
const MERAH = '#EF4444'
const REDUP = '#5F6F80'

/**
 * Grafik tren waktu lap: satu titik per lap, garis putus-putus untuk lap
 * terbaik, lap invalid digambar merah. Hover pada titik menampilkan waktunya
 * (memakai `<title>` bawaan SVG — tanpa JS tambahan).
 */
export function LapChart({ laps, height = 240 }: { laps: Lap[]; height?: number }) {
  const W = 640
  const H = height
  const pad = { kiri: 64, kanan: 18, atas: 16, bawah: 30 }

  const titik: Titik[] = laps
    .filter((l) => typeof l.lapTimeMs === 'number' && (l.lapTimeMs ?? 0) > 0)
    .map((l) => ({
      lap: l.lapNumber,
      ms: l.lapTimeMs as number,
      valid: l.valid,
      isBest: l.isBest,
    }))

  if (titik.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-[#5F6F80]">
        Belum ada waktu lap yang terekam pada balapan ini.
      </p>
    )
  }

  const nilai = titik.map((t) => t.ms)
  const terbaikMs = Math.min(...nilai)
  let bawah = terbaikMs
  let atas = Math.max(...nilai)
  const rentang = Math.max(1, atas - bawah)
  bawah = Math.max(0, bawah - rentang * 0.18)
  atas += rentang * 0.18

  const lapMin = Math.min(...titik.map((t) => t.lap))
  const lapMax = Math.max(...titik.map((t) => t.lap))
  const lebar = W - pad.kiri - pad.kanan
  const tinggi = H - pad.atas - pad.bawah
  const xOf = (lap: number) =>
    lapMax === lapMin ? pad.kiri + lebar / 2 : pad.kiri + ((lap - lapMin) / (lapMax - lapMin)) * lebar
  const yOf = (ms: number) => pad.atas + (1 - (ms - bawah) / (atas - bawah)) * tinggi

  const lapTerbaik = titik.reduce((a, b) => (b.ms < a.ms ? b : a))
  const garisGrid = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(bawah + (atas - bawah) * p))

  // garis tren antar lap yang valid (bila ada lebih dari satu)
  const tren = titik.filter((t) => t.valid).map((t) => `${xOf(t.lap)},${yOf(t.ms)}`)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Grafik waktu lap per putaran"
    >
      {garisGrid.map((v, i) => {
        const y = yOf(v)
        return (
          <g key={i}>
            <line x1={pad.kiri} x2={W - pad.kanan} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
            <text x={pad.kiri - 8} y={y + 4} textAnchor="end" fontSize="10" fill={REDUP}>
              {formatLap(v)}
            </text>
          </g>
        )
      })}

      {/* garis referensi lap terbaik */}
      <line
        x1={pad.kiri}
        x2={W - pad.kanan}
        y1={yOf(lapTerbaik.ms)}
        y2={yOf(lapTerbaik.ms)}
        stroke={AKSEN}
        strokeDasharray="5 4"
        strokeWidth="1"
        opacity="0.75"
      />
      <text
        x={W - pad.kanan}
        y={yOf(lapTerbaik.ms) - 6}
        textAnchor="end"
        fontSize="10"
        fill={AKSEN}
      >
        Terbaik {formatLap(lapTerbaik.ms)}
      </text>

      {/* garis tren antar lap valid */}
      {tren.length > 1 ? (
        <polyline points={tren.join(' ')} fill="none" stroke={AKSEN} strokeWidth="1.5" opacity="0.5" />
      ) : null}

      {titik.map((t) => {
        const cx = xOf(t.lap)
        const cy = yOf(t.ms)
        const warna = t.valid ? AKSEN : MERAH
        return (
          <g key={t.lap}>
            {t.valid ? null : (
              <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={MERAH} strokeWidth="1.5" />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={t.isBest ? 5.5 : 4}
              fill={t.valid ? warna : '#141B24'}
              stroke={warna}
              strokeWidth="1.5"
            >
              <title>{`Lap ${t.lap}: ${formatLap(t.ms)}${t.valid ? '' : ' (invalid)'}`}</title>
            </circle>
          </g>
        )
      })}

      <text x={pad.kiri} y={H - 10} fontSize="10" fill={REDUP}>
        Lap {lapMin}
      </text>
      <text x={W - pad.kanan} y={H - 10} textAnchor="end" fontSize="10" fill={REDUP}>
        Lap {lapMax}
      </text>
    </svg>
  )
}

/**
 * Meter konsistensi sederhana: berapa persen lap yang sah dari total lap
 * berwaktu. Dipakai di halaman detail balapan.
 */
export function ConsistencyMeter({ valid, total }: { valid: number; total: number }) {
  const persen = total > 0 ? Math.round((valid / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#93A3B5]">Konsistensi (lap sah)</span>
        <span className="font-semibold text-[#E9F0F7]">{persen}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#2A3746]">
        <div
          className="h-full rounded-full bg-[#19E3B1]"
          style={{ width: `${Math.min(100, Math.max(0, persen))}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-[#5F6F80]">
        {valid} dari {total} lap sah
      </p>
    </div>
  )
}

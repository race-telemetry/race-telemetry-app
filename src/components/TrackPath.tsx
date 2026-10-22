/**
 * Lintasan yang dilalui mobil (dari `session.result.trackPath`, tersimpan
 * sebagai `path_points` di server). Digambar sebagai SVG polyline — tanpa
 * library. Titik pertama diberi penanda = posisi awal mobil.
 */

type Point = [number, number]

const SIZE = 260
const PAD = 18

export function TrackPath({
  points,
  className = 'mx-auto block h-64 w-64 max-w-full',
}: {
  points: Point[] | null | undefined
  /** Kelas ukuran/posisi — default seperti di halaman detail. */
  className?: string
}) {
  if (!points || points.length < 2) return null

  const xs = points.map((p) => p[0])
  const zs = points.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)
  const lebar = Math.max(maxX - minX, 1e-6)
  const tinggi = Math.max(maxZ - minZ, 1e-6)

  // Skala seragam (aspect ratio dipertahankan) + dipusatkan di kotak.
  const scale = (SIZE - 2 * PAD) / Math.max(lebar, tinggi)
  const geserX = (SIZE - lebar * scale) / 2
  const geserY = (SIZE - tinggi * scale) / 2
  const toXY = ([x, z]: Point): Point => [
    geserX + (x - minX) * scale,
    geserY + (z - minZ) * scale,
  ]

  const d = points
    .map((p, i) => {
      const [px, py] = toXY(p)
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`
    })
    .join(' ')

  const [sx, sy] = toXY(points[0])

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label="Bentuk lintasan yang dilalui"
    >
      <path
        d={d}
        fill="none"
        stroke="#19E3B1"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* penanda posisi awal (titik pertama) */}
      <circle cx={sx} cy={sy} r={8} fill="none" stroke="#19E3B1" strokeOpacity={0.45} strokeWidth={1.5} />
      <circle cx={sx} cy={sy} r={3.5} fill="#19E3B1" />
    </svg>
  )
}

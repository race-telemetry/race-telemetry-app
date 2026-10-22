/** Pemformatan angka, waktu lap, dan waktu relatif (bahasa Indonesia). */

/** 96000 -> "1:36.000" */
export function formatLap(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '—'
  const total = Math.round(ms)
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const millis = total % 1000
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

/** 5_400_000 -> "1j 30m" */
export function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '—'
  const totalMenit = Math.floor(ms / 60000)
  const jam = Math.floor(totalMenit / 60)
  const menit = totalMenit % 60
  if (jam === 0) return `${menit}m`
  return menit === 0 ? `${jam}j` : `${jam}j ${menit}m`
}

/** 320.4 -> "320" (tanpa desimal yang mengganggu) */
export function formatSpeed(kph: number | null | undefined): string {
  if (kph === null || kph === undefined) return '—'
  return String(Math.round(kph))
}

/** 843 -> "843 m", 12450 -> "12,4 km" (jarak tempuh sesi, migrasi 005). */
export function formatDistance(m: number | null | undefined): string {
  if (m === null || m === undefined || !Number.isFinite(m)) return '—'
  if (m < 1000) return `${Math.round(m)} m`
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(m / 1000)} km`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('id-ID').format(value)
}

/** Tanggal panjang: "15 Okt 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Tanggal + jam: "22 Okt 2026, 18.44.55" (waktu lokal browser). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/** "3 jam lalu", "2 hari lalu" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const selisih = Date.now() - date.getTime()
  if (selisih < 0) return 'baru saja'

  const menit = Math.floor(selisih / 60000)
  if (menit < 1) return 'baru saja'
  if (menit < 60) return `${menit} menit lalu`

  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`

  const hari = Math.floor(jam / 24)
  if (hari < 30) return `${hari} hari lalu`

  const bulan = Math.floor(hari / 30)
  if (bulan < 12) return `${bulan} bulan lalu`
  return `${Math.floor(bulan / 12)} tahun lalu`
}

/** "Alice Racer" -> "AR" (untuk avatar). */
export function initials(name: string | null | undefined): string {
  const bersih = (name ?? '').trim()
  if (!bersih) return '?'
  const kata = bersih.split(/\s+/).slice(0, 2)
  return kata.map((k) => k.charAt(0).toUpperCase()).join('')
}

/** Nama tampilan cadangan bila user belum mengisi. */
export function displayNameOf(name: string | null | undefined): string {
  const bersih = (name ?? '').trim()
  return bersih || 'Pembalap'
}

/** "Acc" / "acc" -> "ACC" (kode game dirapikan untuk tampilan). */
export function gameLabel(code: string | null | undefined): string {
  if (!code) return 'Simulator'
  const khusus: Record<string, string> = {
    acc: 'ACC',
    ac: 'Assetto Corsa',
    ac_evo: 'AC Evo',
    f1: 'F1',
    dirt_rally_2: 'DiRT Rally 2.0',
    ea_wrc: 'EA Sports WRC',
    mock: 'Simulator',
  }
  return khusus[code.toLowerCase()] ?? code
}

/** "monza" -> "Monza" */
export function trackLabel(code: string | null | undefined): string {
  if (!code) return 'Sirkuit tidak diketahui'
  return code
    .split(/[_\s]+/)
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(' ')
}

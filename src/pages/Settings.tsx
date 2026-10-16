import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CopyButton,
  Field,
  Input,
  SectionTitle,
  Spinner,
  Switch,
  Textarea,
} from '../components/ui'
import { ApiError, api } from '../lib/api'
import { displayNameOf, formatDate, formatRelative } from '../lib/format'
import { useAuth } from '../state/auth'
import type { Device, DeviceSetup } from '../types'

type Status = { tone: 'good' | 'bad'; text: string } | null

const BATAS_BIO = 280

/** Satu langkah bernomor (dipakai bagian "Hubungkan PC"). */
function Langkah({
  nomor,
  judul,
  children,
}: {
  nomor: number
  judul: string
  children: ReactNode
}) {
  return (
    <div className="border-t border-[#2A3746] pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#19E3B1]/15 text-xs font-bold text-[#19E3B1]">
          {nomor}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#E9F0F7]">{judul}</p>
          <div className="mt-3 space-y-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, token, applyUser, signOut } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [profilePublic, setProfilePublic] = useState(user?.profilePublic ?? true)
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  // --- PC Bridge: alamat server & token device ---------------------------
  const [setup, setSetup] = useState<DeviceSetup | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [memuat, setMemuat] = useState(true)
  const [pesanPc, setPesanPc] = useState<Status>(null)
  const [namaPc, setNamaPc] = useState('')
  const [busyPc, setBusyPc] = useState(false)
  const [tokenBaru, setTokenBaru] = useState<{ nama: string; token: string } | null>(null)

  const muatInfoPc = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return
      try {
        const [info, daftar] = await Promise.all([
          api.deviceSetup(token, signal),
          api.devices(token, signal),
        ])
        setSetup(info)
        setDevices(daftar.data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setPesanPc({
          tone: 'bad',
          text: err instanceof ApiError ? err.message : 'Gagal memuat info PC.',
        })
      } finally {
        setMemuat(false)
      }
    },
    [token],
  )

  useEffect(() => {
    const controller = new AbortController()
    void muatInfoPc(controller.signal)
    return () => controller.abort()
  }, [muatInfoPc])

  if (!user || !token) return null // dijaga oleh RequireAuth
  const authToken = token

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      const res = await api.updateMe(authToken, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePublic,
      })
      applyUser(res.user)
      setStatus({ tone: 'good', text: 'Perubahan tersimpan.' })
    } catch (err) {
      setStatus({
        tone: 'bad',
        text: err instanceof ApiError ? err.message : 'Gagal menyimpan perubahan.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function buatTokenPc() {
    const nama = (namaPc.trim() || 'PC saya').slice(0, 80)
    setBusyPc(true)
    setPesanPc(null)
    try {
      const res = await api.createDevice(authToken, nama)
      setTokenBaru({ nama: res.device.name, token: res.token })
      setNamaPc('')
      setPesanPc({
        tone: 'good',
        text: `PC "${res.device.name}" terdaftar. Salin token di bawah ke PC Bridge.`,
      })
      await muatInfoPc()
    } catch (err) {
      setPesanPc({
        tone: 'bad',
        text: err instanceof ApiError ? err.message : 'Gagal membuat token PC.',
      })
    } finally {
      setBusyPc(false)
    }
  }

  async function cabutPc(device: Device) {
    if (!window.confirm(`Cabut PC "${device.name}"? PC itu tidak bisa lagi mengirim data.`)) {
      return
    }
    setBusyPc(true)
    setPesanPc(null)
    try {
      await api.revokeDevice(authToken, device.id)
      if (tokenBaru) setTokenBaru(null)
      await muatInfoPc()
      setPesanPc({ tone: 'good', text: `PC "${device.name}" dicabut.` })
    } catch (err) {
      setPesanPc({
        tone: 'bad',
        text: err instanceof ApiError ? err.message : 'Gagal mencabut PC.',
      })
    } finally {
      setBusyPc(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Setelan"
        subtitle="Atur profil Anda, dan siapkan PC Bridge di komputer Anda."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* ---------- formulir profil ---------- */}
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {status ? <Alert tone={status.tone}>{status.text}</Alert> : null}

            <Field label="Nama tampilan" hint="Dilihat pembalap lain di timeline.">
              <Input
                required
                maxLength={60}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama pembalap"
              />
            </Field>

            <Field
              label="Bio"
              counter={`${bio.length}/${BATAS_BIO}`}
              hint="Ceritakan singkat: simulator favorit, sirkuit andalan, dsb."
            >
              <Textarea
                rows={3}
                maxLength={BATAS_BIO}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mis. Suka GT3 di Monza."
              />
            </Field>

            <div className="flex items-start gap-4 rounded-xl border border-[#2A3746] bg-[#1D2733]/50 p-4">
              <Switch
                checked={profilePublic}
                onChange={setProfilePublic}
                label="Profil publik"
              />
              <div className="text-xs leading-relaxed text-[#93A3B5]">
                <p className="font-semibold text-[#E9F0F7]">Profil publik</p>
                <p className="mt-1">
                  Bila aktif, sesi balapan Anda muncul di timeline dan halaman profil Anda
                  bisa dibuka siapa saja yang punya tautannya. Bila dimatikan, hanya Anda
                  yang bisa melihatnya.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Menyimpan…' : 'Simpan perubahan'}
              </Button>
              <Link
                to="/feed"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#93A3B5] transition-colors hover:text-[#E9F0F7]"
              >
                Batal
              </Link>
            </div>
          </form>
        </Card>

        {/* ---------- info akun ---------- */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar name={user.displayName} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#E9F0F7]">
                  {displayNameOf(user.displayName)}
                </p>
                <p className="truncate text-xs text-[#5F6F80]">{user.email}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-[#5F6F80]">Bergabung</dt>
                <dd className="text-[#93A3B5]">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#5F6F80]">Status profil</dt>
                <dd className={user.profilePublic ? 'text-[#19E3B1]' : 'text-[#FACC15]'}>
                  {user.profilePublic ? 'Publik' : 'Privat'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#5F6F80]">PC terdaftar</dt>
                <dd className="text-[#93A3B5]">
                  {devices.filter((d) => d.active).length} aktif
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                to={`/u/${user.id}`}
                className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-4 py-2.5 text-center text-sm font-semibold text-[#E9F0F7] transition-colors hover:bg-[#243040]"
              >
                Lihat profil saya
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  signOut()
                  navigate('/')
                }}
              >
                Keluar dari akun
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
              Menghubungkan PC
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#93A3B5]">
              Ada <strong>dua hal</strong> yang harus dipasang di PC Bridge:{' '}
              <strong>alamat server</strong> + <strong>token PC</strong> (bagian di bawah),
              lalu <strong>masuk sebagai pembalap</strong> memakai akun ini.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#5F6F80]">
              Tanpa pembalap yang login, PC Bridge menahan data balapan — server menolak
              kiriman tanpa akun yang jelas.
            </p>
          </Card>
        </div>
      </div>

      {/* ---------- PC Bridge: alamat server & token ---------- */}
      <Card className="mt-6 p-6">
        <SectionTitle
          title="Hubungkan PC (PC Bridge)"
          subtitle="Rujukan untuk diisi di aplikasi Race Telemetry Bridge di komputer Anda."
        />

        {pesanPc ? (
          <div className="mt-4">
            <Alert tone={pesanPc.tone}>{pesanPc.text}</Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {/* Langkah 1 */}
          <Langkah nomor={1} judul="Salin alamat server ke PC Bridge">
            {memuat ? (
              <p className="flex items-center gap-2 text-xs text-[#5F6F80]">
                <Spinner /> Memuat alamat server…
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    readOnly
                    value={setup?.wsUrl ?? ''}
                    onFocus={(e) => e.currentTarget.select()}
                    className="font-mono text-xs"
                    aria-label="Alamat server"
                  />
                  <CopyButton value={setup?.wsUrl ?? ''} />
                </div>
                <p className="text-xs leading-relaxed text-[#93A3B5]">
                  Tempel di PC Bridge → halaman <strong>Server</strong> → kolom{' '}
                  <em>Alamat server</em>. Bentuknya{' '}
                  <code className="rounded bg-[#1D2733] px-1 py-0.5 font-mono text-[11px]">
                    {setup?.wsUrl?.startsWith('wss') ? 'wss://…/ingest' : 'ws://…/ingest'}
                  </code>{' '}
                  — <strong>salin apa adanya</strong>, jangan menambah/mengurangi huruf
                  (salah satu huruf saja, mis. memakai <code className="rounded bg-[#1D2733] px-1 font-mono text-[11px]">wss://</code> untuk
                  server lokal, membuat PC Bridge gagal menyambung).
                </p>
                {setup?.source === 'derived' ? (
                  <p className="text-xs leading-relaxed text-[#5F6F80]">
                    Catatan: alamat ini disimpulkan dari alamat website yang Anda buka.
                    Bila pemilik aplikasi memberi alamat lain, pakai alamat dari dia.
                  </p>
                ) : null}
              </>
            )}
          </Langkah>

          {/* Langkah 2 */}
          <Langkah nomor={2} judul="Buat token PC, lalu tempel di PC Bridge">
            <p className="text-xs leading-relaxed text-[#93A3B5]">
              Satu token hanya untuk <strong>satu PC</strong>. Token ditampilkan{' '}
              <strong>sekali saja</strong> — salin dulu ke PC Bridge sebelum menutup
              halaman ini.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={namaPc}
                maxLength={80}
                onChange={(e) => setNamaPc(e.target.value)}
                placeholder="Nama PC (mis. PC Balap Kamar)"
                aria-label="Nama PC"
              />
              <Button
                type="button"
                variant="primary"
                onClick={buatTokenPc}
                disabled={busyPc}
                className="shrink-0"
              >
                {busyPc ? 'Memproses…' : 'Buat token PC'}
              </Button>
            </div>

            {tokenBaru ? (
              <div className="rounded-xl border border-[#19E3B1]/40 bg-[#19E3B1]/5 p-4">
                <p className="text-sm font-semibold text-[#19E3B1]">
                  Token untuk “{tokenBaru.nama}” — salin sekarang
                </p>
                <p className="mt-1 text-xs text-[#93A3B5]">
                  Tempel di PC Bridge → halaman <strong>Server</strong> → kolom{' '}
                  <em>Token device</em>, lalu klik <strong>Simpan pengaturan</strong>.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    readOnly
                    value={tokenBaru.token}
                    onFocus={(e) => e.currentTarget.select()}
                    className="font-mono text-xs"
                    aria-label="Token device"
                  />
                  <CopyButton value={tokenBaru.token} />
                </div>
                <p className="mt-2 text-xs text-[#FACC15]">
                  Token ini tidak bisa dilihat lagi setelah halaman ditutup atau di-refresh.
                  Kalau hilang, buat token baru (yang lama otomatis dicabut).
                </p>
              </div>
            ) : null}

            <div className="rounded-xl border border-[#2A3746]">
              <div className="flex items-center justify-between gap-3 border-b border-[#2A3746] px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#93A3B5] uppercase">
                  PC terdaftar
                </p>
                {memuat ? <Spinner /> : null}
              </div>
              {devices.length === 0 && !memuat ? (
                <p className="px-4 py-6 text-center text-xs text-[#5F6F80]">
                  Belum ada PC terdaftar. Buat token di atas, lalu isi ke PC Bridge.
                </p>
              ) : (
                <ul className="divide-y divide-[#2A3746]">
                  {devices.map((device) => (
                    <li
                      key={device.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#E9F0F7]">
                          {device.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#5F6F80]">
                          Dibuat {formatDate(device.createdAt)}
                          {device.lastSeenAt
                            ? ` · terakhir terlihat ${formatRelative(device.lastSeenAt)}`
                            : ' · belum pernah terhubung'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={device.active ? 'good' : 'neutral'}>
                          {device.active ? 'aktif' : 'dicabut'}
                        </Badge>
                        {device.active ? (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => cabutPc(device)}
                            disabled={busyPc}
                          >
                            Cabut
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Langkah>

          {/* Langkah 3 */}
          <Langkah nomor={3} judul="Masuk sebagai pembalap di PC Bridge">
            <p className="text-xs leading-relaxed text-[#93A3B5]">
              Di PC Bridge → halaman <strong>Pembalap</strong>, masuk memakai akun ini:
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={user.email}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-xs"
                aria-label="Email akun"
              />
              <CopyButton value={user.email} label="Salin email" />
            </div>
            <p className="text-xs leading-relaxed text-[#5F6F80]">
              Sandi Anda <strong>tidak disimpan</strong> di PC — hanya dipakai sekali saat
              masuk. Setelah itu klik <strong>Mulai</strong> di PC Bridge dan jalankan game.
            </p>
          </Langkah>
        </div>
      </Card>
    </>
  )
}

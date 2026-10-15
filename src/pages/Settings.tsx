import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import { Alert, Avatar, Button, Card, Field, Input, Switch, Textarea } from '../components/ui'
import { ApiError, api } from '../lib/api'
import { displayNameOf, formatDate } from '../lib/format'
import { useAuth } from '../state/auth'

type Status = { tone: 'good' | 'bad'; text: string } | null

const BATAS_BIO = 280

export default function Settings() {
  const { user, token, applyUser, signOut } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [profilePublic, setProfilePublic] = useState(user?.profilePublic ?? true)
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  if (!user || !token) return null // dijaga oleh RequireAuth

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      const res = await api.updateMe(token as string, {
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

  return (
    <>
      <PageHeader
        title="Setelan"
        subtitle="Atur bagaimana Anda tampil di timeline dan halaman profil."
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
              Pastikan PC Bridge di komputer Anda memakai <strong>akun ini</strong> —
              token device didaftarkan oleh pemilik aplikasi lewat dashboard admin.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

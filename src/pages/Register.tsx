import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Alert, Button, Card, Field, Input } from '../components/ui'
import { ApiError } from '../lib/api'
import { useAuth } from '../state/auth'

export default function Register() {
  const { user, ready, signUp } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (ready && user) return <Navigate to="/feed" replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signUp(email.trim(), password, displayName.trim())
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mendaftar. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-[#E9F0F7]">Buat akun</h1>
      <p className="mt-1 text-sm text-[#93A3B5]">
        Nama tampilan inilah yang dilihat pembalap lain di timeline.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <Alert tone="bad">{error}</Alert> : null}

          <Field label="Nama tampilan" hint="Mis. “Ariq D.” — bisa diubah nanti di Setelan.">
            <Input
              required
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama pembalap"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@contoh.com"
            />
          </Field>

          <Field label="Kata sandi" hint="Minimal 8 karakter.">
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? 'Membuat akun…' : 'Daftar'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-[#93A3B5]">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-[#19E3B1] hover:opacity-80">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Alert, Button, Card, Field, Input } from '../components/ui'
import { ApiError } from '../lib/api'
import { useAuth } from '../state/auth'

type LocationState = { from?: string } | null

export default function Login() {
  const { user, ready, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as LocationState)?.from ?? '/feed'

  if (ready && user) return <Navigate to={from} replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Latar halaman login: foto dari img_assets + lapisan gelap & blur. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img
          src="/img_assets/homescreen.jpg"
          alt=""
          className="h-full w-full object-contain opacity-45 blur-[3px]"
        />
        <div className="absolute inset-0 bg-[#0A0E14]/75" />
      </div>

      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-[#E9F0F7]">Masuk</h1>
      <p className="mt-1 text-sm text-[#93A3B5]">
        Gunakan akun yang sama dengan yang dipakai PC Bridge.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <Alert tone="bad">{error}</Alert> : null}

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

          <Field label="Kata sandi">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-[#93A3B5]">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-[#19E3B1] hover:opacity-80">
            Daftar di sini
          </Link>
        </p>
      </Card>
      </div>
    </>
  )
}

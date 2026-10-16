import { useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

import { initials } from '../lib/format'

/* ==========================================================================
   Dasar
   ========================================================================== */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-[#2A3746] bg-[#141B24] shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset] ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-xs text-[#5F6F80]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

/* ==========================================================================
   Tombol
   ========================================================================== */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#19E3B1] text-[#04120E] hover:bg-[#22F0BD] disabled:bg-[#19E3B1]/40 disabled:text-[#04120E]/60',
  secondary:
    'bg-[#1D2733] text-[#E9F0F7] border border-[#2A3746] hover:bg-[#243040] disabled:opacity-50',
  danger:
    'bg-transparent text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/10 disabled:opacity-50',
  ghost: 'bg-transparent text-[#93A3B5] hover:text-[#E9F0F7] disabled:opacity-50',
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

/* ==========================================================================
   Formulir
   ========================================================================== */
export function Field({
  label,
  hint,
  error,
  counter,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  counter?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-[0.12em] text-[#93A3B5] uppercase">
        <span>{label}</span>
        {counter ? <span className="font-normal tracking-normal text-[#5F6F80]">{counter}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-[#EF4444]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[#5F6F80]">{hint}</span>
      ) : null}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-[#2A3746] bg-[#1D2733] px-3.5 py-2.5 text-sm text-[#E9F0F7] outline-none transition-colors placeholder:text-[#5F6F80] focus:border-[#19E3B1] focus:ring-2 focus:ring-[#19E3B1]/20 disabled:opacity-60'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${className}`} />
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none ${className}`} />
}

/** Saklar on/off (dipakai untuk "profil publik"). */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
        checked ? 'border-[#19E3B1] bg-[#19E3B1]/25' : 'border-[#2A3746] bg-[#1D2733]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
          checked ? 'left-5.5 bg-[#19E3B1]' : 'left-0.5 bg-[#5F6F80]'
        }`}
        style={{ height: 18, width: 18, left: checked ? 24 : 3, top: 3 }}
      />
    </button>
  )
}

/* ==========================================================================
   Indikator
   ========================================================================== */
type Tone = 'neutral' | 'good' | 'warn' | 'bad'

const badgeStyles: Record<Tone, string> = {
  neutral: 'bg-[#1D2733] text-[#93A3B5] border-[#2A3746]',
  good: 'bg-[#19E3B1]/10 text-[#19E3B1] border-[#19E3B1]/40',
  warn: 'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/40',
  bad: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/40',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  )
}

export function Alert({ tone = 'bad', children }: { tone?: Tone; children: ReactNode }) {
  const styles: Record<Tone, string> = {
    neutral: 'border-[#2A3746] bg-[#1D2733] text-[#93A3B5]',
    good: 'border-[#19E3B1]/40 bg-[#19E3B1]/10 text-[#19E3B1]',
    warn: 'border-[#FACC15]/40 bg-[#FACC15]/10 text-[#FACC15]',
    bad: 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]',
  }
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-sm ${styles[tone]}`}>{children}</div>
  )
}

/**
 * Tombol "Salin" untuk teks yang harus dipindahkan ke aplikasi lain (mis. alamat
 * server & token device untuk PC Bridge). Menampilkan konfirmasi singkat.
 */
export function CopyButton({
  value,
  label = 'Salin',
  className = '',
}: {
  value: string
  label?: string
  className?: string
}) {
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard API bisa diblokir (bukan HTTPS / izin ditolak).
      const area = document.createElement('textarea')
      area.value = value
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setTersalin(true)
    setTimeout(() => setTersalin(false), 1800)
  }

  return (
    <Button
      type="button"
      variant={tersalin ? 'primary' : 'secondary'}
      onClick={salin}
      className={`shrink-0 ${className}`}
      aria-live="polite"
    >
      {tersalin ? 'Tersalin ✓' : label}
    </Button>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#2A3746] border-t-[#19E3B1] ${className}`}
      role="status"
      aria-label="memuat"
    />
  )
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#2A3746] px-4 py-10 text-center">
      <p className="text-sm font-semibold text-[#93A3B5]">{title}</p>
      {message ? <p className="mt-1 text-xs text-[#5F6F80]">{message}</p> : null}
    </div>
  )
}

/* ==========================================================================
   Profil
   ========================================================================== */
/** Avatar bulat dengan warna yang diturunkan dari nama (selalu sama per nama). */
export function Avatar({ name, size = 40 }: { name: string | null | undefined; size?: number }) {
  const hue = [...(name ?? '?')].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 7)
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        height: size,
        width: size,
        fontSize: size * 0.38,
        backgroundColor: `hsl(${hue} 45% 20%)`,
        color: `hsl(${hue} 75% 72%)`,
        border: `1px solid hsl(${hue} 45% 30%)`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

export function StatTile({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string
  value: string
  unit?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-[#2A3746] bg-[#1D2733]/50 px-3.5 py-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#5F6F80] uppercase">
        {label}
      </p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span
          className={`mono text-xl font-bold ${accent ? 'text-[#19E3B1]' : 'text-[#E9F0F7]'}`}
        >
          {value}
        </span>
        {unit ? <span className="text-xs text-[#93A3B5]">{unit}</span> : null}
      </p>
    </div>
  )
}

import { Link } from 'react-router-dom'

import {
  displayNameOf,
  formatLap,
  formatRelative,
  formatSpeed,
  gameLabel,
  trackLabel,
} from '../lib/format'
import type { RaceSummary } from '../types'
import { Avatar, Badge } from './ui'

/**
 * Satu entri di timeline.
 *
 * `owner` diisi bila kartu ini ditampilkan di feed (menampilkan pemiliknya).
 * Di halaman profil, pemiliknya tidak perlu diulang.
 */
export function SessionCard({
  race,
  owner,
}: {
  race: RaceSummary
  owner?: { id: string; displayName: string | null }
}) {
  const selesai = race.status === 'finished'
  const waktu = race.endedAt ?? race.startedAt

  return (
    <article className="fade-up rounded-2xl border border-[#2A3746] bg-[#141B24] transition-colors hover:border-[#19E3B1]/30">
      <div className="flex items-start gap-4 p-4">
        {owner ? (
          <Link to={`/u/${owner.id}`} className="shrink-0" aria-label={displayNameOf(owner.displayName)}>
            <Avatar name={owner.displayName} size={42} />
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {owner ? (
              <Link
                to={`/u/${owner.id}`}
                className="truncate text-sm font-semibold text-[#E9F0F7] hover:text-[#19E3B1]"
              >
                {displayNameOf(owner.displayName)}
              </Link>
            ) : null}
            <span className="text-[#5F6F80]">·</span>
            <span className="truncate text-sm text-[#93A3B5]">{trackLabel(race.track)}</span>
            <Badge tone="neutral">{gameLabel(race.game)}</Badge>
            <Badge tone={selesai ? 'good' : 'warn'}>{selesai ? 'Selesai' : 'Terhenti'}</Badge>
          </div>

          <p className="mt-1 text-xs text-[#5F6F80]">
            {race.sessionType} · {formatRelative(waktu)}
            {race.car ? ` · ${race.car}` : ''}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Lap" value={String(race.totalLaps)} />
            <Stat label="Lap terbaik" value={formatLap(race.bestLapMs)} accent />
            <Stat label="Rata-rata" value={formatLap(race.avgLapMs)} />
            <Stat label="Top speed" value={`${formatSpeed(race.topSpeedKph)}`} unit="km/h" />
          </dl>
        </div>
      </div>
    </article>
  )
}

function Stat({
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
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.12em] text-[#5F6F80] uppercase">
        {label}
      </dt>
      <dd className={`mono text-sm font-bold ${accent ? 'text-[#19E3B1]' : 'text-[#E9F0F7]'}`}>
        {value}
        {unit ? <span className="ml-1 text-[10px] font-normal text-[#93A3B5]">{unit}</span> : null}
      </dd>
    </div>
  )
}

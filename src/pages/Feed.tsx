import { useCallback } from 'react'

import { PageHeader } from '../components/Layout'
import { SessionCard } from '../components/SessionCard'
import { Alert, Button, EmptyState, Spinner } from '../components/ui'
import { api } from '../lib/api'
import { usePagedList } from '../lib/usePagedList'
import type { FeedItem } from '../types'

const PAGE = 10

export default function Feed() {
  const fetcher = useCallback(
    (offset: number, signal: AbortSignal) => api.feed({ limit: PAGE, offset, signal }),
    [],
  )
  const { items, loading, loadingMore, error, hasMore, total, reload, loadMore } =
    usePagedList<FeedItem>(fetcher, 'feed')

  return (
    <>
      <PageHeader
        title="Timeline"
        subtitle={
          loading ? 'Memuat aktivitas…' : `${total} sesi balapan yang sudah selesai.`
        }
        action={
          <Button variant="secondary" onClick={reload} disabled={loading}>
            Muat ulang
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : error ? (
        <Alert tone="bad">{error}</Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="Timeline masih kosong"
          message="Belum ada sesi balapan yang selesai. Jalankan PC Bridge lalu selesaikan satu sesi."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <SessionCard key={item.id} race={item} owner={item.user} />
          ))}

          {hasMore ? (
            <div className="flex justify-center pt-3">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
              </Button>
            </div>
          ) : (
            <p className="pt-3 text-center text-xs text-[#5F6F80]">
              Semua aktivitas sudah ditampilkan.
            </p>
          )}
        </div>
      )}
    </>
  )
}

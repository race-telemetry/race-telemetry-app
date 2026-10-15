/**
 * Hook daftar berhalaman (dipakai Timeline & riwayat di halaman profil).
 *
 * Menangani: muat awal, "muat lebih banyak", pembatalan permintaan saat unmount,
 * dan pesan error yang ramah.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from './api'
import type { Paginated } from '../types'

export type PagedList<T> = {
  items: T[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  total: number
  reload: () => void
  loadMore: () => void
}

export function usePagedList<T>(
  fetcher: (offset: number, signal: AbortSignal) => Promise<Paginated<T>>,
  key = '',
): PagedList<T> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const controller = useRef<AbortController | null>(null)

  const load = useCallback(
    async (offset: number, append: boolean) => {
      controller.current?.abort()
      const ac = new AbortController()
      controller.current = ac

      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)

      try {
        const page = await fetcherRef.current(offset, ac.signal)
        setItems((prev) => (append ? [...prev, ...page.data] : page.data))
        setHasMore(page.pagination.hasMore)
        setTotal(page.pagination.total)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof ApiError ? err.message : 'Gagal memuat data.')
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    void load(0, false)
    return () => controller.current?.abort()
  }, [load, key])

  const reload = useCallback(() => void load(0, false), [load])
  const loadMore = useCallback(
    () => void load(items.length, true),
    [load, items.length],
  )

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    reload,
    loadMore,
  }
}

export { usePagedList as default }

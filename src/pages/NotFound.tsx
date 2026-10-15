import { Link } from 'react-router-dom'

import { PageHeader } from '../components/Layout'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <>
      <PageHeader title="404 — halaman tidak ada" />
      <EmptyState
        title="Halaman yang Anda cari tidak ditemukan"
        message="Tautannya mungkin salah, atau halaman sudah dipindahkan."
      />
      <div className="mt-6 flex justify-center">
        <Link
          to="/"
          className="rounded-xl bg-[#19E3B1] px-5 py-3 text-sm font-semibold text-[#04120E] transition-colors hover:bg-[#22F0BD]"
        >
          Kembali ke halaman utama
        </Link>
      </div>
    </>
  )
}

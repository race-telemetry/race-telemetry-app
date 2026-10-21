import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SessionCard } from "../components/SessionCard";
import { Button, Card, EmptyState, Spinner } from "../components/ui";
import { ApiError, api } from "../lib/api";
import { useAuth } from "../state/auth";
import type { FeedItem } from "../types";

const FITUR = [
  {
    judul: "Timeline publik",
    isi: "Semua sesi balapan yang sudah selesai dari seluruh pembalap, dalam satu aliran.",
  },
  {
    judul: "Profil pembalap",
    isi: "Halaman profil dengan statistik: sesi, lap, lap terbaik, dan kecepatan tertinggi.",
  },
  {
    judul: "Langganan otomatis",
    isi: "PC Bridge mengirim telemetri; hasil balapan langsung masuk ke timeline Anda.",
  },
];

export default function Landing() {
  const { user, ready } = useAuth();
  const [terbaru, setTerbaru] = useState<FeedItem[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback((signal: AbortSignal) => {
    setMemuat(true);
    setGalat(null);
    api
      .feed({ limit: 4, signal })
      .then((res) => setTerbaru(res.data))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setGalat(
          err instanceof ApiError ? err.message : "Gagal memuat aktivitas.",
        );
      })
      .finally(() => setMemuat(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    muat(controller.signal);
    return () => controller.abort();
  }, [muat]);

  return (
    <div className="space-y-14">
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden rounded-3xl border border-[#2A3746] bg-[#141B24]">
        <div
          className="grid-fade pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
        />
        <div className="relative px-6 py-14 sm:px-10 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#19E3B1]/40 bg-[#19E3B1]/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-[#19E3B1] uppercase">
            Telemetry &amp; Race Tracking
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight text-[#E9F0F7] sm:text-5xl">
            Race Telemetry <span className="text-[#19E3B1]">App</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#93A3B5] sm:text-base">
            Kumpulan hasil balapan dari simulator racing — telemetri dari PC
            Bridge, hasil lap yang sudah divalidasi server, dan profil tiap
            pembalap.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/feed"
              className="rounded-xl bg-[#19E3B1] px-5 py-3 text-sm font-semibold text-[#04120E] transition-colors hover:bg-[#22F0BD]"
            >
              Lihat timeline
            </Link>
            {ready && !user ? (
              <Link
                to="/register"
                className="rounded-xl border border-[#2A3746] bg-[#1D2733] px-5 py-3 text-sm font-semibold text-[#E9F0F7] transition-colors hover:bg-[#243040]"
              >
                Buat akun
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------- fitur ---------- */}
      <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
          Yang bisa Anda lakukan
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {FITUR.map((item) => (
            <Card key={item.judul} className="p-5">
              <h3 className="text-sm font-semibold text-[#E9F0F7]">
                {item.judul}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#93A3B5]">
                {item.isi}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- aktivitas terbaru ---------- */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
              Aktivitas terbaru
            </h2>
            <p className="mt-1 text-xs text-[#5F6F80]">
              Sesi yang sudah selesai dari pembalap yang profilnya publik.
            </p>
          </div>
          <Link
            to="/feed"
            className="text-xs font-semibold text-[#19E3B1] transition-opacity hover:opacity-80"
          >
            Lihat semua →
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {memuat ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : galat ? (
            <Card className="p-5">
              <p className="text-sm text-[#EF4444]">{galat}</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  const controller = new AbortController();
                  muat(controller.signal);
                }}
              >
                Coba lagi
              </Button>
            </Card>
          ) : terbaru.length === 0 ? (
            <EmptyState
              title="Belum ada aktivitas"
              message="Jalankan PC Bridge dan selesaikan satu sesi balapan untuk mengisinya."
            />
          ) : (
            terbaru.map((item) => (
              <SessionCard key={item.id} race={item} owner={item.user} />
            ))
          )}
        </div>
      </section>

      {/* ---------- cara kerja ---------- */}
      {/* <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#93A3B5] uppercase">
          Cara kerjanya
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ['1', 'Bridge membaca game', 'PC Bridge membaca telemetri dari Shared Memory atau UDP.'],
            ['2', 'Server memvalidasi', 'Cloud Bridge menghitung ulang lap & personal best Anda.'],
            ['3', 'Muncul di sini', 'Hasilnya masuk ke timeline dan profil Anda.'],
          ].map(([nomor, judul, isi]) => (
            <li key={nomor} className="rounded-2xl border border-[#2A3746] bg-[#141B24] p-5">
              <span className="mono text-xs font-bold text-[#19E3B1]">{nomor}</span>
              <h3 className="mt-2 text-sm font-semibold text-[#E9F0F7]">{judul}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#93A3B5]">{isi}</p>
            </li>
          ))}
        </ol>
      </section> */}
    </div>
  );
}

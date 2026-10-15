# Race Telemetry App

Aplikasi web untuk **semua pengguna** ekosistem Race Telemetry: timeline balapan,
profil pembalap, dan setelan akun. Bagian dari ekosistem yang sama dengan
PC Bridge, Cloud Bridge, dan Dashboard Admin.

## Stack

| Bagian | Teknologi |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Gaya | Tailwind CSS 4 (palet sama dengan dashboard admin & mobile) |
| Routing | react-router-dom 7 |
| Data | REST ke Cloud Bridge (`/api/*`, lewat proxy Vite) |

## Halaman

| Rute | Akses | Isi |
|---|---|---|
| `/` | publik | Landing page: penjelasan singkat + pratinjau aktivitas terbaru |
| `/feed` | publik | **Timeline** semua sesi balapan yang sudah selesai, dengan paginasi |
| `/u/:id` | publik | **Profil pembalap**: bio, statistik, dan riwayat balapan |
| `/login`, `/register` | publik | Autentikasi (JWT) |
| `/settings` | **butuh login** | Setelan: nama tampilan, bio, saklar profil publik |
| `*` | publik | Halaman 404 |

> **Catatan privasi:** timeline & profil dapat dibuka siapa saja yang punya
> tautannya. Setiap user bisa mematikan ini di **Setelan → Profil publik**; bila
> dimatikan, sesinya hilang dari timeline dan halaman profilnya menjadi 404.

## Menjalankan

```powershell
# 1) Cloud Bridge harus jalan lebih dulu (dari folder cloud-bridge)
cd ..\cloud-bridge
$env:BOOTSTRAP_ADMIN='1'; $env:BOOTSTRAP_USER_EMAIL='owner@racetelemetry.id'
$env:BOOTSTRAP_USER_PASSWORD='ownerrahasia123'
npm start

# 2) Aplikasi ini (port 5174)
cd ..\race-telemetry-app
npm install
npm run dev        # buka http://127.0.0.1:5174
```

Atau dari root proyek: `.\start-local.ps1` (menyalakan API + dashboard admin +
aplikasi ini sekaligus).

Perintah lain:

```powershell
npm run build      # typecheck (tsc) + build produksi ke dist/
npm run lint       # oxlint
npm run preview    # uji hasil build (port 4174)
```

## Struktur

```
src/
  App.tsx                    daftar rute + penjaga halaman (RequireAuth)
  types.ts                   tipe bersama (Me, PublicUser, RaceSummary, FeedItem)
  index.css                  palet & gaya dasar (sama dengan dashboard admin)
  lib/
    api.ts                   klien REST (semua endpoint + ApiError)
    session.ts               penyimpanan token JWT
    format.ts                format waktu lap, durasi, waktu relatif, label game
    usePagedList.ts          hook daftar berhalaman (muat awal + muat lebih banyak)
  state/
    auth.ts                  context + hook useAuth
    AuthContext.tsx          provider (pulihkan sesi, masuk, daftar, keluar)
  components/
    ui.tsx                   Card, Button, Field, Input, Textarea, Switch, Badge,
                             Alert, Spinner, EmptyState, Avatar, StatTile
    Layout.tsx               header + navigasi + footer + PageHeader
    SessionCard.tsx          satu entri timeline
  pages/
    Landing.tsx  Feed.tsx  Profile.tsx  Settings.tsx  Login.tsx  Register.tsx
    NotFound.tsx
```

## Endpoint Cloud Bridge yang dipakai

| Endpoint | Token | Keterangan |
|---|---|---|
| `POST /api/auth/login` \| `/register` | — | masuk / daftar, mengembalikan JWT |
| `GET /api/me` | JWT | profil sendiri (termasuk email) |
| `PATCH /api/me` | JWT | ubah nama tampilan, bio, `profilePublic` |
| `GET /api/feed` | — | timeline publik (hanya sesi selesai & profil publik) |
| `GET /api/users/:id` | — | profil publik + statistik |
| `GET /api/users/:id/races` | — | riwayat balapan user tersebut |

`/api/feed` dan `/api/users/*` **tidak pernah** mengirim email atau token.

## Konfigurasi

Salin `.env.example` ke `.env` hanya bila API berada di domain lain:

```
VITE_API_BASE=https://api.domain.com
```

Bila aplikasi & API satu domain (atau saat `npm run dev`, karena sudah diproxy
ke `127.0.0.1:8080`), biarkan kosong.

import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { displayNameOf } from "../lib/format";
import { useAuth } from "../state/auth";
import { Avatar, Button } from "./ui";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-[#1D2733] text-[#E9F0F7]"
      : "text-[#93A3B5] hover:bg-[#1D2733] hover:text-[#E9F0F7]"
  }`;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      aria-label="Race Telemetry App"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#19E3B1]/40 bg-[#19E3B1]/10">
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          style={{ height: 18, width: 18 }}
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="none"
            stroke="#19E3B1"
            strokeWidth="2"
          />
          <path
            d="M12 7v10M8 10.5h8"
            stroke="#19E3B1"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-sm font-bold text-[#E9F0F7]">
            Race Telemetry
          </span>
          <span className="block text-[10px] tracking-[0.18em] text-[#5F6F80] uppercase">
            App
          </span>
        </span>
      )}
    </Link>
  );
}

function Header() {
  const { user, token, ready, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-[#2A3746] bg-[#0A0E14]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3">
        <Logo />

        <nav className="ml-2 flex items-center gap-1">
          <NavLink to="/feed" className={navLink}>
            Timeline
          </NavLink>
          {user ? (
            <NavLink to={`/u/${user.id}`} className={navLink}>
              Profil
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/settings" className={navLink}>
              Setelan
            </NavLink>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!ready ? null : user && token ? (
            <>
              <Link
                to={`/u/${user.id}`}
                className="hidden items-center gap-2 rounded-xl border border-[#2A3746] bg-[#141B24] px-3 py-1.5 transition-colors hover:border-[#19E3B1]/40 sm:flex"
              >
                <Avatar name={user.displayName} size={24} />
                <span className="max-w-[10rem] truncate text-xs font-semibold text-[#E9F0F7]">
                  {displayNameOf(user.displayName)}
                </span>
              </Link>
              <Button
                variant="ghost"
                className="px-3 py-2 text-xs"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
              >
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#93A3B5] transition-colors hover:text-[#E9F0F7]"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#19E3B1] px-4 py-2 text-sm font-semibold text-[#04120E] transition-colors hover:bg-[#22F0BD]"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#2A3746] px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 text-xs text-[#5F6F80] sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-[#93A3B5]">
            Race Telemetry App
          </span>{" "}
          — timeline & statistik dari simulator racing.
        </p>
        <p>Made with ♡. Egomaniac. Pantang Pulang Sebelum Balap</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** Judul halaman yang konsisten. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#E9F0F7]">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#93A3B5]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

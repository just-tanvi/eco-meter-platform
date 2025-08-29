// components/navbar.tsx
// Public top navigation (auth removed)

"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-700" aria-hidden />
          <span className="font-sans text-lg font-semibold text-slate-900">ECO METER</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-sm text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/schedule" className="text-sm text-slate-700 hover:text-slate-900">
            Schedule
          </Link>
          <Link href="/leaderboard" className="text-sm text-slate-700 hover:text-slate-900">
            Leaderboards
          </Link>
          <Link href="/rewards" className="text-sm text-slate-700 hover:text-slate-900">
            Rewards
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/schedule"
            className="rounded bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Schedule
          </Link>
        </div>
      </div>
    </header>
  )
}

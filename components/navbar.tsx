// components/navbar.tsx
// Top navigation with brand, links, and auth actions

import Link from "next/link"
import { getSupabaseServerClientSafe } from "@/lib/supabase/server"

export default async function Navbar() {
  const supabase = getSupabaseServerClientSafe()

  let user: { email?: string | null } | null = null
  if (supabase) {
    const {
      data: { user: u },
    } = await supabase.auth.getUser()
    user = u
  }

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
            Leaderboard
          </Link>
          <Link href="/rewards" className="text-sm text-slate-700 hover:text-slate-900">
            Rewards
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-700 md:inline">Hi, {user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

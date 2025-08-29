// components/navbar.tsx
// Top navigation with brand, links, and auth actions

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClientSafe } from "@/lib/supabase/client"

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClientSafe()
    if (!supabase) {
      // No envs configured; render public navbar state
      setUserEmail(null)
      return
    }

    let isMounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      setUserEmail(data.user?.email ?? null)
    })

    // Optional: subscribe to auth state changes so the navbar updates live
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      isMounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

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
          {userEmail ? (
            <>
              <span className="hidden text-sm text-slate-700 md:inline">Hi, {userEmail}</span>
              {/* Client components cannot post to server actions directly; route handler handles signout */}
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

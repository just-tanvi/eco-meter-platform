// app/dashboard/page.tsx
// User dashboard: summary, quick schedule, friends leaderboard

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Navbar from "@/components/navbar"
import ScheduleForm from "@/components/schedule-form"
import { ContributionsWidget } from "@/components/dashboard/contributions-widget"
import Leaderboard from "@/components/leaderboard"
import FriendsManager from "@/components/friends-manager"

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-balance font-sans text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 font-sans text-sm text-slate-700">Where change counts.</p>

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <ContributionsWidget />

            <div className="rounded border border-gray-200 p-4">
              <h2 className="font-sans text-lg font-semibold text-slate-900">Quick schedule</h2>
              <p className="mb-3 text-sm text-slate-700">Schedule a pickup or request a drop-off window.</p>
              <ScheduleForm />
            </div>

            <div className="rounded border border-gray-200 p-4">
              <h2 className="font-sans text-lg font-semibold text-slate-900">Friends leaderboard</h2>
              <Leaderboard initialScope="friends" />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded border border-gray-200 p-4">
              <h3 className="font-sans text-base font-semibold text-slate-900">Add friends</h3>
              <p className="mb-3 text-sm text-slate-700">
                Add friends by username to compete on a smaller leaderboard.
              </p>
              <FriendsManager />
            </div>

            <div className="rounded border border-gray-200 p-4">
              <h3 className="font-sans text-base font-semibold text-slate-900">Badges</h3>
              <ul className="grid gap-2 text-sm text-slate-700">
                <li>• Starter: 100 pts</li>
                <li>• Recycler: 500 pts</li>
                <li>• Eco Champion: 1,500 pts</li>
              </ul>
              <a href="/rewards" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
                View rewards →
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

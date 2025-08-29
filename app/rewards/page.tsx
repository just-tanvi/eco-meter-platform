// app/rewards/page.tsx

import Navbar from "@/components/navbar"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function RewardsPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch total points to show status (server-side aggregation)
  let totalPoints = 0
  let totalKg = 0
  if (user) {
    const { data, error } = await supabase.from("contributions").select("points, weight_kg").eq("user_id", user.id)

    if (!error && data) {
      totalPoints = data.reduce((acc, r) => acc + (r.points ?? 0), 0)
      totalKg = data.reduce((acc, r) => acc + (Number(r.weight_kg) || 0), 0)
    }
  }

  const nextBadge =
    totalPoints < 100
      ? { name: "Starter", need: 100 - totalPoints }
      : totalPoints < 500
        ? { name: "Recycler", need: 500 - totalPoints }
        : totalPoints < 1500
          ? { name: "Eco Champion", need: 1500 - totalPoints }
          : null

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-sans text-2xl font-semibold text-slate-900">Rewards</h1>
        <p className="mt-1 font-sans text-sm text-slate-700">Earn badges and recognition for your impact.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded bg-blue-700 p-4 text-white">
            <p className="text-xs text-blue-100">Total points</p>
            <p className="text-2xl font-semibold">{totalPoints}</p>
          </div>
          <div className="rounded bg-teal-600 p-4 text-white">
            <p className="text-xs text-teal-50">Total kg</p>
            <p className="text-2xl font-semibold">{totalKg.toFixed(1)}</p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-xs text-slate-600">Next milestone</p>
            <p className="text-2xl font-semibold text-slate-900">
              {nextBadge ? `${nextBadge.name} in ${nextBadge.need} pts` : "All badges unlocked!"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded border border-gray-200 p-4">
          <h2 className="font-sans text-lg font-semibold text-slate-900">Badges</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            <li className="rounded border border-gray-200 p-3">
              <p className="text-sm font-semibold text-slate-900">Starter</p>
              <p className="text-xs text-slate-700">100 points</p>
            </li>
            <li className="rounded border border-gray-200 p-3">
              <p className="text-sm font-semibold text-slate-900">Recycler</p>
              <p className="text-xs text-slate-700">500 points</p>
            </li>
            <li className="rounded border border-gray-200 p-3">
              <p className="text-sm font-semibold text-slate-900">Eco Champion</p>
              <p className="text-xs text-slate-700">1,500 points</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

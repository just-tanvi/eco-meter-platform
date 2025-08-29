// app/rewards/page.tsx

export const dynamic = "force-dynamic"

import Navbar from "@/components/navbar"
import { headers } from "next/headers"

export default async function RewardsPage() {
  let totalPoints = 0
  let totalKg = 0

  try {
    const h = headers()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`

    const res = await fetch(`${baseUrl}/api/contributions`, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      totalPoints = json?.summary?.total_points ?? 0
      totalKg = json?.summary?.total_kg ?? 0
    }
  } catch {
    // ignore and keep defaults
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

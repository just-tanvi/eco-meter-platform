// app/leaderboard/page.tsx

import Navbar from "@/components/navbar"
import Leaderboard from "@/components/leaderboard"

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-sans text-2xl font-semibold text-slate-900">Leaderboard</h1>
        <p className="mt-1 font-sans text-sm text-slate-700">
          Worldwide and friends leaderboards for active recyclers.
        </p>
        <div className="mt-6">
          <Leaderboard initialScope="global" />
        </div>
      </div>
    </main>
  )
}

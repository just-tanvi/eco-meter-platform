// components/leaderboard.tsx
"use client"

import { useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Leaderboard({ initialScope = "global" as "global" | "friends" }) {
  const [scope, setScope] = useState<"global" | "friends">(initialScope)
  const { data, isLoading, error } = useSWR(`/api/leaderboard?scope=${scope}`, fetcher)
  const entries = data?.entries ?? []

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setScope("global")}
          className={`rounded px-3 py-2 text-sm font-semibold ${
            scope === "global" ? "bg-blue-700 text-white" : "border border-gray-300 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Worldwide
        </button>
        <button
          onClick={() => setScope("friends")}
          className={`rounded px-3 py-2 text-sm font-semibold ${
            scope === "friends" ? "bg-teal-600 text-white" : "border border-gray-300 text-slate-700 hover:bg-gray-50"
          }`}
        >
          Friends
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-700">Loading leaderboard…</p>}
      {error && <p className="text-sm text-red-600">Failed to load leaderboard.</p>}

      <ol className="divide-y divide-gray-200 rounded border border-gray-200">
        {entries.map((e: any, idx: number) => (
          <li key={e.user_id} className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-slate-100 font-semibold text-slate-700">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{e.username || e.email}</p>
                <p className="text-xs text-slate-600">
                  {e.total_points} pts • {e.total_kg.toFixed(1)} kg
                </p>
              </div>
            </div>
            <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">ECO METER</span>
          </li>
        ))}
        {!isLoading && entries.length === 0 && <li className="px-3 py-2 text-sm text-slate-600">No entries yet.</li>}
      </ol>
    </div>
  )
}

// components/dashboard/contributions-widget.tsx
"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ContributionsWidget() {
  const { data, isLoading, error, mutate } = useSWR("/api/contributions", fetcher)

  if (isLoading) return <div className="text-sm text-slate-700">Loading contributions…</div>
  if (error) return <div className="text-sm text-red-600">Failed to load contributions.</div>

  const totalKg = data?.summary?.total_kg ?? 0
  const totalPoints = data?.summary?.total_points ?? 0
  const totalPickups = data?.summary?.total_pickups ?? 0

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded bg-blue-700 p-4 text-white">
        <p className="text-xs text-blue-100">Total kg recycled</p>
        <p className="text-2xl font-semibold">{totalKg.toFixed(1)}</p>
      </div>
      <div className="rounded bg-teal-600 p-4 text-white">
        <p className="text-xs text-teal-50">Points earned</p>
        <p className="text-2xl font-semibold">{totalPoints}</p>
      </div>
      <div className="rounded border border-gray-200 p-4">
        <p className="text-xs text-slate-600">Pickups completed</p>
        <p className="text-2xl font-semibold text-slate-900">{totalPickups}</p>
      </div>
    </div>
  )
}

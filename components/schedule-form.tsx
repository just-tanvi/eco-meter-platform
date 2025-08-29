// components/schedule-form.tsx
"use client"

import type React from "react"
import { useState } from "react"

export default function ScheduleForm({ onScheduled }: { onScheduled?: () => void }) {
  const [type, setType] = useState<"pickup" | "dropoff">("pickup")
  const [address, setAddress] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    try {
      const pickupAtIso = new Date(scheduledAt).toISOString()
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, address, pickupAt: pickupAtIso }),
      })

      if (!res.ok) {
        let msg = "Failed to schedule"
        try {
          const j = await res.json()
          if (j?.message) msg = j.message
        } catch {}
        throw new Error(msg)
      }

      setOk(true)
      setAddress("")
      setScheduledAt("")
      onScheduled?.()
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm text-slate-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
          >
            <option value="pickup">Pickup</option>
            <option value="dropoff">Drop-off</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm text-slate-700">Address / Location</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Green Ln or Recycling Center #4"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-slate-700">Date & time</label>
        <input
          type="datetime-local"
          required
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-teal-700">Scheduled successfully!</p>}
      <button
        disabled={loading}
        className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? "Scheduling…" : "Schedule"}
      </button>
    </form>
  )
}

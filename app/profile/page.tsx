// app/profile/page.tsx
"use client"

import type React from "react"

import useSWR from "swr"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const { data, mutate } = useSWR("/api/profile", fetcher)
  const [username, setUsername] = useState("")

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
    mutate()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-sans text-2xl font-semibold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-700">Set your public username.</p>
      <form onSubmit={save} className="mt-6 space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-slate-700">Username</label>
          <input
            placeholder={data?.profile?.username || "your-username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
          />
        </div>
        <button className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Save</button>
      </form>
    </main>
  )
}

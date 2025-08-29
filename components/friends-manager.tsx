// components/friends-manager.tsx
"use client"

import type React from "react"

import useSWR from "swr"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FriendsManager() {
  const { data, mutate } = useSWR("/api/friends", fetcher)
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function addFriend(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "Failed to add friend")
      }
      setOk(true)
      setUsername("")
      mutate()
    } catch (err: any) {
      setError(err?.message ?? "Failed to add friend")
    }
  }

  const friends = data?.friends ?? []

  return (
    <div className="space-y-4">
      <form onSubmit={addFriend} className="flex gap-2">
        <input
          placeholder="Friend's username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
        />
        <button className="rounded bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-teal-700">Friend added!</p>}
      <ul className="divide-y divide-gray-200 rounded border border-gray-200">
        {friends.map((f: any) => (
          <li key={f.friend_id} className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{f.friend_username || f.friend_email}</p>
              <p className="text-xs text-slate-600">{f.friend_email}</p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">Friend</span>
          </li>
        ))}
        {friends.length === 0 && <li className="px-3 py-2 text-sm text-slate-600">No friends yet. Add one above.</li>}
      </ul>
    </div>
  )
}

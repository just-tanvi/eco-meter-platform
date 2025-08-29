// app/api/friends/route.ts
// GET my friends; POST add friend by username

import { NextResponse } from "next/server"

// Force dynamic so this route isn't statically cached during build
export const dynamic = "force-dynamic"
export const revalidate = 0

type Friend = {
  friend_id: string
  friend_username: string | null
  friend_email: string | null
}

// Simple in-memory store for friends (mock). Resets on cold start.
const mockFriends: Friend[] = [
  { friend_id: "friend-1", friend_username: "green_ally", friend_email: "green_ally@example.com" },
  { friend_id: "friend-2", friend_username: "recycle_hero", friend_email: "recycle_hero@example.com" },
]

export async function GET() {
  return NextResponse.json({ friends: mockFriends })
}

export async function POST(req: Request) {
  let username: string | undefined

  const contentType = req.headers.get("content-type") || ""
  try {
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}))
      username = typeof body?.username === "string" ? body.username.trim() : undefined
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const body = await req.formData()
      const raw = body.get("username")
      if (typeof raw === "string") username = raw.trim()
    } else {
      // Try JSON as a fallback
      const body = await req.json().catch(() => ({}))
      username = typeof body?.username === "string" ? body.username.trim() : undefined
    }
  } catch {
    // ignore parse errors; we'll validate below
  }

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  // Prevent obvious duplicates by username (case-insensitive)
  const exists = mockFriends.some((f) => (f.friend_username || "").toLowerCase() === username!.toLowerCase())
  if (exists) {
    return NextResponse.json({ error: "Already added" }, { status: 409 })
  }

  // Create a new mock friend
  const id = (globalThis.crypto?.randomUUID?.() ?? `friend-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
  const email = `${username.replace(/\s+/g, "_").toLowerCase()}@example.com`

  const created: Friend = {
    friend_id: id,
    friend_username: username,
    friend_email: email,
  }
  mockFriends.push(created)

  return NextResponse.json({ ok: true, friend: created })
}

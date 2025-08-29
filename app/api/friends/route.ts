// app/api/friends/route.ts
// GET my friends; POST add friend by username

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Force dynamic so this route isn't statically cached during build
export const dynamic = "force-dynamic"
export const revalidate = 0

type Friend = {
  friend_id: string
  friend_username: string | null
  friend_email: string | null
}

// In-memory store per user (keyed by em_uid cookie)
const g = globalThis as unknown as { __friendsStore?: Map<string, Friend[]> }
if (!g.__friendsStore) g.__friendsStore = new Map()
const store = g.__friendsStore!

function getOrCreateUserId(): { uid: string; created: boolean } {
  const jar = cookies()
  const existing = jar.get("em_uid")?.value
  if (existing) return { uid: existing, created: false }
  const uid = `u_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, "0")}`
  // Set cookie for 180 days
  jar.set("em_uid", uid, { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax" })
  return { uid, created: true }
}

function getUserFriends(uid: string): Friend[] {
  if (!store.has(uid)) {
    // Seed with sample friends the first time
    store.set(uid, [
      { friend_id: "friend-1", friend_username: "green_ally", friend_email: "green_ally@example.com" },
      { friend_id: "friend-2", friend_username: "recycle_hero", friend_email: "recycle_hero@example.com" },
    ])
  }
  // Always return the actual array to push into it later
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return store.get(uid)!
}

function makeId() {
  try {
    // Prefer Web Crypto if available
    // @ts-ignore
    const uuid = globalThis.crypto?.randomUUID?.()
    if (uuid) return uuid
  } catch {}
  // Fallback
  return `friend_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, "0")}`
}

export async function GET() {
  try {
    const { uid } = getOrCreateUserId()
    const friends = getUserFriends(uid)
    return NextResponse.json({ friends })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { uid } = getOrCreateUserId()
    const friends = getUserFriends(uid)

    // Parse body (JSON or FormData)
    let username: string | undefined
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => ({}))) as any
      username = typeof body?.username === "string" ? body.username.trim() : undefined
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const fd = await req.formData().catch(() => null)
      const raw = fd?.get("username")
      if (typeof raw === "string") username = raw.trim()
    } else {
      // Try JSON as a fallback
      const body = (await req.json().catch(() => ({}))) as any
      username = typeof body?.username === "string" ? body.username.trim() : undefined
    }

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Basic validation
    if (!/^[a-zA-Z0-9_\-.]{2,32}$/.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 })
    }

    // Prevent duplicates (case-insensitive)
    const exists = friends.some((f) => (f.friend_username || "").toLowerCase() === username!.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: "Already added" }, { status: 409 })
    }

    const id = makeId()
    const email = `${username.replace(/\s+/g, "_").toLowerCase()}@example.com`

    const created: Friend = {
      friend_id: id,
      friend_username: username,
      friend_email: email,
    }
    friends.push(created)

    return NextResponse.json({ ok: true, friend: created })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// app/api/friends/route.ts
// GET my friends; POST add friend by username

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("friends")
    .select("friend_id, friend_username, friend_email")
    .eq("user_id", auth.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ friends: data ?? [] })
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 })

  // find profile by username
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, username, email")
    .ilike("username", username)
    .maybeSingle()

  if (pErr || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (profile.id === auth.user.id) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })
  }

  // upsert friendship (one-directional; you may add both directions in UI)
  const { error } = await supabase.from("friends").insert({
    user_id: auth.user.id,
    friend_id: profile.id,
    friend_username: profile.username,
    friend_email: profile.email,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// app/api/pickups/route.ts
// POST: schedule; GET: list my pickups

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("scheduled_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ pickups: data })
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, address, scheduled_at } = body || {}
  if (!type || !address || !scheduled_at) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { error } = await supabase.from("pickups").insert({
    user_id: auth.user.id,
    type,
    address,
    scheduled_at,
    status: "scheduled",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

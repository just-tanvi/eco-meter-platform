// app/api/contributions/route.ts
// GET: my contributions + summary; POST: add manual contribution record

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const total_kg = data?.reduce((acc, r) => acc + (Number(r.weight_kg) || 0), 0) ?? 0
  const total_points = data?.reduce((acc, r) => acc + (r.points ?? 0), 0) ?? 0

  // count completed pickups for the user
  const { data: ps } = await supabase
    .from("pickups")
    .select("id, status")
    .eq("user_id", auth.user.id)
    .eq("status", "completed")

  return NextResponse.json({
    contributions: data,
    summary: {
      total_kg,
      total_points,
      total_pickups: ps?.length ?? 0,
    },
  })
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { material_type, weight_kg } = body || {}
  if (!material_type || !weight_kg) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const weight = Number(weight_kg)
  const points = Math.max(1, Math.round(weight * 10)) // simple points rule: 10 pts per kg

  const { error } = await supabase.from("contributions").insert({
    user_id: auth.user.id,
    material_type,
    weight_kg: weight,
    points,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, points })
}

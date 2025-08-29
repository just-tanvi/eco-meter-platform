// app/api/leaderboard/route.ts
// GET global or friends leaderboard

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(req.url)
  const scope = (searchParams.get("scope") as "global" | "friends") || "global"

  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id

  if (scope === "friends") {
    if (!userId) return NextResponse.json({ entries: [] })
    // get friend ids + self
    const { data: fr } = await supabase.from("friends").select("friend_id").eq("user_id", userId)
    const ids = [userId, ...(fr?.map((x) => x.friend_id) ?? [])]

    const { data, error } = await supabase.from("contributions").select("user_id, points, weight_kg").in("user_id", ids)

    if (error) return NextResponse.json({ entries: [] })

    // fetch profiles for labels
    const { data: profs } = await supabase.from("profiles").select("id, username, email").in("id", ids)

    const sums: Record<
      string,
      { user_id: string; total_points: number; total_kg: number; username?: string; email?: string }
    > = {}
    for (const r of data || []) {
      const id = r.user_id as string
      if (!sums[id]) sums[id] = { user_id: id, total_points: 0, total_kg: 0 }
      sums[id].total_points += r.points ?? 0
      sums[id].total_kg += Number(r.weight_kg) || 0
    }
    for (const p of profs || []) {
      if (sums[p.id]) {
        sums[p.id].username = (p as any).username
        sums[p.id].email = (p as any).email
      }
    }
    const entries = Object.values(sums).sort((a, b) => b.total_points - a.total_points)
    return NextResponse.json({ entries })
  }

  // global
  const { data, error } = await supabase.from("contributions").select("user_id, points, weight_kg")
  if (error) return NextResponse.json({ entries: [] })

  // top map
  const sums: Record<string, { user_id: string; total_points: number; total_kg: number }> = {}
  for (const r of data || []) {
    const id = r.user_id as string
    if (!sums[id]) sums[id] = { user_id: id, total_points: 0, total_kg: 0 }
    sums[id].total_points += r.points ?? 0
    sums[id].total_kg += Number(r.weight_kg) || 0
  }
  const topIds = Object.entries(sums)
    .sort((a, b) => b[1].total_points - a[1].total_points)
    .slice(0, 50)
    .map(([id]) => id)

  const { data: profs } = await supabase.from("profiles").select("id, username, email").in("id", topIds)

  const labelById = new Map((profs || []).map((p) => [p.id, p]))
  const entries = topIds.map((id) => ({
    user_id: id,
    total_points: sums[id].total_points,
    total_kg: sums[id].total_kg,
    username: (labelById.get(id) as any)?.username,
    email: (labelById.get(id) as any)?.email,
  }))

  return NextResponse.json({ entries })
}

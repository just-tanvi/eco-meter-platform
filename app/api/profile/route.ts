// app/api/profile/route.ts
// GET my profile; POST upsert username/email

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ profile: null })

  const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle()
  return NextResponse.json({ profile: data })
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const username = body?.username?.trim()
  const email = auth.user.email

  const { error } = await supabase.from("profiles").upsert({
    id: auth.user.id,
    username: username || null,
    email,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

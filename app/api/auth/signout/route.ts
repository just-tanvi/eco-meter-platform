// app/api/auth/signout/route.ts
// Sign out via server route

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = getSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost"))
}

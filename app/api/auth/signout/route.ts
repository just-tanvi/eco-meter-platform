// app/api/auth/signout/route.ts
// Sign out via server route

import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  // Try to sign out, but don't crash if Supabase isn't configured
  try {
    const supabase = getSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {
    // Swallow errors so logout never breaks the app even if env vars are missing
  }

  // Redirect to the homepage on the SAME ORIGIN to avoid "site can't be reached"
  return NextResponse.redirect(new URL("/", req.url))
}

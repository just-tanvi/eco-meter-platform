// lib/supabase/server.ts
// Supabase server client (singleton) per @supabase/ssr guidelines

import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

let _serverClient: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServerClientSafe() {
  // Prefer non-public on server; fall back to NEXT_PUBLIC if provided
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return null if envs are not present to avoid throwing during render
    return null
  }

  if (_serverClient) return _serverClient

  const cookieStore = cookies()
  const headerStore = headers()

  _serverClient = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(_name: string, _value: string, _options: any) {
        // no-op in this environment
      },
      remove(_name: string, _options: any) {
        // no-op in this environment
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Forwarded-For": headerStore.get("x-forwarded-for") || "",
        "X-Client-Info": "eco-meter-app",
      },
    },
  })

  return _serverClient
}

export function getSupabaseServerClient() {
  const client = getSupabaseServerClientSafe()
  if (!client) {
    const missing = [
      !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL"
        : null,
      !process.env.SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        : null,
    ]
      .filter(Boolean)
      .join(", ")
    throw new Error(
      `Supabase server client cannot be created. Missing environment variable(s): ${missing}. ` +
        `Add them in Project Settings > Environment Variables.`,
    )
  }
  return client
}

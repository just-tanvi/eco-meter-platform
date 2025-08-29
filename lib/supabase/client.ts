// lib/supabase/client.ts
// Supabase browser client (singleton) per @supabase/ssr guidelines

"use client"

import { createBrowserClient } from "@supabase/ssr"

let _browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (_browserClient) return _browserClient

  _browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return _browserClient
}

// Safe variant that returns null if envs are missing
export function getSupabaseBrowserClientSafe() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  if (_browserClient) return _browserClient
  _browserClient = createBrowserClient(url, key)
  return _browserClient
}

import type { createServerClient } from "@supabase/ssr"

const _serverClient: ReturnType<typeof createServerClient> | null = null

/**
 * Supabase removed. These helpers now return null or throw with a clear message.
 * This avoids importing next/headers or @supabase/ssr in client/server paths.
 */

export function getSupabaseServerClientSafe() {
  // Always return null; call sites should handle the unauthenticated/public state.
  return null
}

export function getSupabaseServerClient() {
  // Explicitly inform that Supabase has been removed.
  throw new Error("Supabase has been removed from this project. No server client is available.")
}

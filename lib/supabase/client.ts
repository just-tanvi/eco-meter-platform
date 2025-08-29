// lib/supabase/client.ts
// Supabase browser client (singleton) per @supabase/ssr guidelines

"use client"

/**
 * Supabase removed. These helpers now return null or throw with a clear message.
 * This avoids importing @supabase/ssr in the browser.
 */

export function getSupabaseBrowserClient() {
  throw new Error("Supabase has been removed from this project. No browser client is available.")
}

export function getSupabaseBrowserClientSafe() {
  // Always return null; call sites should handle the unauthenticated/public state.
  return null
}

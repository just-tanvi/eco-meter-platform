// app/api/schedule/route.ts
// Public scheduling endpoint (no auth). Attempts DB insert if Supabase is configured,
// otherwise returns ok:true, stored:false so the UI doesn't fail.

// and never hard-fail if Supabase/env/DB is unavailable.

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

type SchedulePayload = {
  pickupAt?: string
  pickup_at?: string
  scheduled_at?: string
  address?: string
  type?: "pickup" | "dropoff" | string
  materials?: string[] | string | null
  notes?: string | null
}

function normalizeMaterials(input: SchedulePayload["materials"]): string[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input
      .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

export async function POST(req: Request) {
  // Parse body: JSON first, fallback to FormData
  let raw: any = null
  try {
    raw = await req.json()
  } catch {
    try {
      const form = await req.formData()
      raw = Object.fromEntries(form.entries())
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "INVALID_PAYLOAD", message: "Body must be JSON or FormData." }),
        { status: 400, headers: { "content-type": "application/json" } },
      )
    }
  }

  const body = raw as SchedulePayload
  const pickupAtInput = (body.pickupAt || body.pickup_at || body.scheduled_at || "").toString().trim()
  const address = (body.address || "").toString().trim()
  const type = (body.type || "pickup").toString().trim() as "pickup" | "dropoff" | string
  const materials = normalizeMaterials(body.materials ?? [])
  const notes = (body.notes ?? "").toString().trim() || null

  if (!pickupAtInput || !address) {
    return new Response(
      JSON.stringify({ ok: false, error: "VALIDATION_ERROR", message: "pickupAt and address are required" }),
      { status: 400, headers: { "content-type": "application/json" } },
    )
  }

  const d = new Date(pickupAtInput)
  if (isNaN(d.getTime())) {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_DATETIME", message: "pickupAt must be a valid date string." }),
      { status: 400, headers: { "content-type": "application/json" } },
    )
  }
  const pickup_at = d.toISOString()

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, don't fail the UX—pretend-succeed.
  if (!url || !anon) {
    return new Response(
      JSON.stringify({
        ok: true,
        stored: false,
        hint: "Supabase not configured; submission accepted without storage.",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )
  }

  // Create server client (no auth required)
  const cookieStore = cookies()
  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })

  try {
    // Try to insert; some schemas may not include `type/materials/notes/status/user_id`.
    // Insert minimal fields first; if your schema has more required fields, run the provided SQL.
    const { data, error } = await supabase
      .from("pickups")
      .insert({
        // user_id intentionally omitted (public submissions)
        pickup_at,
        address,
        // Best-effort: include optional fields if your schema supports them
        type,
        materials,
        notes,
        status: "scheduled",
      })
      .select("id")
      .single()

    if (error) {
      // Degrade gracefully: accept without storage and provide a hint
      const msg = (error as any)?.message || "Database error"
      const payload: Record<string, any> = {
        ok: true,
        stored: false,
        hint: "Submission accepted but could not be stored. See 'details' for help.",
        details: msg,
      }
      if (/relation .*pickups.* does not exist/i.test(msg)) {
        payload.tag = "TABLE_MISSING"
        payload.fix = "Run scripts/002_create_pickups.sql"
      } else if (/row-level security/i.test(msg)) {
        payload.tag = "RLS_BLOCKED"
        payload.fix = "Adjust RLS to allow anonymous inserts or remove RLS requirement."
      } else if (/null value in column .* violates not-null constraint/i.test(msg)) {
        payload.tag = "NOT_NULL_VIOLATION"
        payload.fix = "Ensure required columns have defaults or are provided."
      }
      return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } })
    }

    return new Response(JSON.stringify({ ok: true, stored: true, id: data?.id }), {
      status: 201,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    // Unknown DB failure — still accept without storage
    return new Response(
      JSON.stringify({
        ok: true,
        stored: false,
        hint: "Submission accepted but storage failed unexpectedly.",
        details: e?.message || "Unknown error",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )
  }
}

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

type SchedulePayload = {
  pickupAt: string
  address: string
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
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return new Response(
      JSON.stringify({
        error: "SERVICE_UNAVAILABLE",
        message: "Supabase is not configured",
        hint: "Add SUPABASE_URL and SUPABASE_ANON_KEY in Project Settings > Environment Variables.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    )
  }

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

  // Try JSON; if it fails, fall back to FormData (supports application/x-www-form-urlencoded & multipart/form-data)
  let raw: any = null
  try {
    raw = await req.json()
  } catch {
    try {
      const form = await req.formData()
      raw = {
        pickupAt: form.get("pickupAt") || form.get("pickup_at") || "",
        address: form.get("address") || "",
        materials: form.getAll("materials")?.length ? form.getAll("materials") : form.get("materials") || "",
        notes: form.get("notes") || "",
      }
    } catch {
      return new Response(JSON.stringify({ error: "INVALID_PAYLOAD", message: "Body must be JSON or FormData." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }
  }

  const body = raw as SchedulePayload
  const pickupAtRaw = (body?.pickupAt || "").toString().trim()
  const address = (body?.address || "").toString().trim()
  const materials = normalizeMaterials(body?.materials ?? [])
  const notes = (body?.notes ?? "").toString().trim() || null

  if (!pickupAtRaw || !address) {
    return new Response(
      JSON.stringify({
        error: "VALIDATION_ERROR",
        message: "pickupAt and address are required",
      }),
      { status: 400, headers: { "content-type": "application/json" } },
    )
  }

  const d = new Date(pickupAtRaw)
  if (isNaN(d.getTime())) {
    return new Response(
      JSON.stringify({
        error: "INVALID_DATETIME",
        message: "pickupAt must be a valid date string (ISO preferred).",
      }),
      { status: 400, headers: { "content-type": "application/json" } },
    )
  }
  const pickup_at = d.toISOString()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return new Response(
      JSON.stringify({
        error: "UNAUTHENTICATED",
        message: userError?.message || "You must be signed in to schedule a pickup.",
      }),
      { status: 401, headers: { "content-type": "application/json" } },
    )
  }

  try {
    const { data, error } = await supabase
      .from("pickups")
      .insert({
        user_id: user.id,
        pickup_at,
        address,
        materials,
        notes,
        status: "scheduled",
      })
      .select("id")
      .single()

    if (error) {
      const msg = error.message || "Database error"
      const pgcode = (error as any).code
      const errPayload: Record<string, any> = { error: "DB_ERROR", message: msg }
      if (pgcode) errPayload.code = pgcode

      // Common hints
      if (/relation .*pickups.* does not exist/i.test(msg)) {
        errPayload.hint = "Run scripts/002_create_pickups.sql to create the pickups table."
        errPayload.tag = "TABLE_MISSING"
      } else if (/new row violates row-level security policy/i.test(msg)) {
        errPayload.hint = "Ensure RLS policies allow inserts for auth.uid() = user_id."
        errPayload.tag = "RLS_BLOCKED"
      }

      return new Response(JSON.stringify(errPayload), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ id: data?.id, ok: true }), {
      status: 201,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: "UNKNOWN_ERROR",
        message: e?.message || "Unknown error",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }
}

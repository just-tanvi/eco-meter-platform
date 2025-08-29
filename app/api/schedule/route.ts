import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

type SchedulePayload = {
  pickupAt: string // ISO datetime
  address: string
  materials?: string[] // optional list of materials
  notes?: string
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guard: if Supabase is not configured, don't throw, just respond 503
  if (!url || !anon) {
    return new Response(
      JSON.stringify({
        error: "Supabase is not configured",
        hint: "Missing SUPABASE_URL and/or SUPABASE_ANON_KEY. Add them in Project Settings > Environment Variables.",
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
        // set cookie via next/headers
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })

  let body: SchedulePayload
  try {
    body = (await req.json()) as SchedulePayload
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const { pickupAt, address, materials = [], notes } = body || {}
  if (!pickupAt || !address) {
    return new Response(JSON.stringify({ error: "pickupAt and address are required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  // Auth: require a logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  // Insert scheduled pickup
  try {
    const { data, error } = await supabase
      .from("pickups")
      .insert({
        user_id: user.id,
        pickup_at: pickupAt,
        address,
        materials,
        notes,
        status: "scheduled",
      })
      .select("id")
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ id: data?.id, ok: true }), {
      status: 201,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}

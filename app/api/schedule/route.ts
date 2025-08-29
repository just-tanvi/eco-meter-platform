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

// In-memory "DB" for mock scheduling
const MEMORY_DB = {
  pickups: [] as Array<{
    id: string
    created_at: string
    pickup_at: string
    address: string
    type: string
    materials: string[]
    notes: string | null
    status: "scheduled"
  }>,
}

function uuid() {
  // Prefer Web Crypto if available
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  // Fallback simple UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST(req: Request) {
  // Parse body: try JSON, then FormData
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

  const record = {
    id: uuid(),
    created_at: new Date().toISOString(),
    pickup_at,
    address,
    type,
    materials,
    notes,
    status: "scheduled" as const,
  }

  MEMORY_DB.pickups.push(record)

  return new Response(JSON.stringify({ ok: true, stored: true, id: record.id }), {
    status: 201,
    headers: { "content-type": "application/json" },
  })
}

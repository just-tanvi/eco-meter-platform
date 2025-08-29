import { NextResponse } from "next/server"

type Contribution = {
  id: string
  material_type: string
  weight_kg: number
  points: number
  created_at: string
}

// In-memory store (mock). Note: not persistent across deployments.
const contributions: Contribution[] = [
  // Seed with a tiny sample so Rewards shows something non-zero
  { id: "seed-1", material_type: "paper", weight_kg: 1.2, points: 12, created_at: new Date().toISOString() },
  { id: "seed-2", material_type: "plastic", weight_kg: 0.7, points: 7, created_at: new Date().toISOString() },
]

export const dynamic = "force-dynamic"

function summarize(list: Contribution[]) {
  const total_kg = list.reduce((acc, r) => acc + (Number(r.weight_kg) || 0), 0)
  const total_points = list.reduce((acc, r) => acc + (r.points ?? 0), 0)
  const total_pickups = 0 // mock
  return { total_kg, total_points, total_pickups }
}

export async function GET() {
  return NextResponse.json({
    contributions,
    summary: summarize(contributions),
  })
}

export async function POST(req: Request) {
  // Accept JSON or FormData
  let material_type = ""
  let weight_kg: number | null = null

  const contentType = req.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}))
    material_type = body?.material_type || ""
    weight_kg = body?.weight_kg != null ? Number(body.weight_kg) : null
  } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData()
    material_type = String(form.get("material_type") || "")
    const w = form.get("weight_kg")
    weight_kg = w != null ? Number(w) : null
  }

  if (!material_type || weight_kg == null || Number.isNaN(weight_kg)) {
    return NextResponse.json({ error: "Missing fields", fields: { material_type, weight_kg } }, { status: 400 })
  }

  const weight = Number(weight_kg)
  const points = Math.max(1, Math.round(weight * 10)) // 10 pts per kg
  const record: Contribution = {
    id: `c_${Date.now()}`,
    material_type,
    weight_kg: weight,
    points,
    created_at: new Date().toISOString(),
  }
  contributions.unshift(record)

  return NextResponse.json({ ok: true, points, contribution: record, summary: summarize(contributions) })
}

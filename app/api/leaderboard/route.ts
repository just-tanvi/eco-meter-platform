import { NextResponse } from "next/server"

// Force dynamic to avoid prerender/caching issues and ensure this route runs on every request.
export const dynamic = "force-dynamic"

type Entry = {
  user_id: string
  total_points: number
  total_kg: number
  username?: string
  email?: string
}

// Simple in-memory mock data for demonstration.
// You can adjust these to reflect realistic totals for your app.
const MOCK_GLOBAL: Entry[] = [
  { user_id: "u_ecohero", username: "EcoHero", email: "ecohero@example.com", total_points: 12450, total_kg: 982.4 },
  {
    user_id: "u_greenmachine",
    username: "GreenMachine",
    email: "greenm@example.com",
    total_points: 11090,
    total_kg: 876.2,
  },
  {
    user_id: "u_recyclequeen",
    username: "RecycleQueen",
    email: "rq@example.com",
    total_points: 10310,
    total_kg: 845.5,
  },
  { user_id: "u_blueplanet", username: "BluePlanet", email: "bp@example.com", total_points: 9800, total_kg: 799.3 },
  { user_id: "u_sageguardian", username: "SageGuardian", email: "sg@example.com", total_points: 9400, total_kg: 760.1 },
  { user_id: "u_binbuddy", username: "BinBuddy", email: "bbuddy@example.com", total_points: 9025, total_kg: 742.8 },
  { user_id: "u_cleancity", username: "CleanCity", email: "ccity@example.com", total_points: 8890, total_kg: 731.0 },
  { user_id: "u_sortsmart", username: "SortSmart", email: "ss@example.com", total_points: 8610, total_kg: 715.6 },
  { user_id: "u_earthally", username: "EarthAlly", email: "ea@example.com", total_points: 8425, total_kg: 701.2 },
  { user_id: "u_cyclechamp", username: "CycleChamp", email: "champ@example.com", total_points: 8300, total_kg: 695.0 },
]

// Friends mock is a subset + small variations.
const MOCK_FRIENDS: Entry[] = [
  { user_id: "u_me", username: "You", email: "you@example.com", total_points: 4200, total_kg: 310.5 },
  { user_id: "u_friend_a", username: "Alex", email: "alex@example.com", total_points: 5100, total_kg: 355.2 },
  { user_id: "u_friend_b", username: "Blake", email: "blake@example.com", total_points: 3800, total_kg: 290.7 },
  { user_id: "u_friend_c", username: "Casey", email: "casey@example.com", total_points: 5600, total_kg: 370.1 },
  { user_id: "u_friend_d", username: "Dev", email: "dev@example.com", total_points: 4450, total_kg: 325.0 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scopeParam = searchParams.get("scope")
  const scope = (scopeParam === "friends" ? "friends" : "global") as "global" | "friends"

  // Select mock dataset
  const entries = scope === "friends" ? MOCK_FRIENDS : MOCK_GLOBAL

  return NextResponse.json(
    { entries },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}

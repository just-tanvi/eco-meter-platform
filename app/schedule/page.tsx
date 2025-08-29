// app/schedule/page.tsx

import { redirect } from "next/navigation"
import { getSupabaseServerClientSafe } from "@/lib/supabase/server"
import Navbar from "@/components/navbar"
import ScheduleForm from "@/components/schedule-form"

export default async function SchedulePage() {
  const supabase = getSupabaseServerClientSafe()

  // If Supabase isn't configured, render a friendly setup message instead of throwing
  if (!supabase) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="font-sans text-2xl font-semibold text-slate-900">Schedule</h1>
          <div className="mt-4 rounded border border-gray-200 bg-white p-4">
            <p className="font-sans text-sm text-slate-700">
              Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY (or their NEXT_PUBLIC_*
              equivalents) in Project Settings &gt; Environment Variables to enable authentication and scheduling.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-sans text-2xl font-semibold text-slate-900">Schedule</h1>
        <p className="mt-1 font-sans text-sm text-slate-700">Pick a time for pickup or drop-off.</p>
        <div className="mt-6 rounded border border-gray-200 p-4">
          <ScheduleForm />
        </div>
      </div>
    </main>
  )
}

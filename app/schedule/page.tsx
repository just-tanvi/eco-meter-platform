// app/schedule/page.tsx

import Navbar from "@/components/navbar"
import ScheduleForm from "@/components/schedule-form"

export default function SchedulePage() {
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

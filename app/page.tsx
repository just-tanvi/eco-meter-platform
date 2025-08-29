// app/page.tsx
// Marketing homepage: name, tagline, primary CTA. Colors: Primary Blue, Accent Sage Green, Neutrals.

import Link from "next/link"
import Navbar from "@/components/navbar"

export default function HomePage() {
  return (
    <main>
      {/* Navbar */}
      {/* Using async server component within layout by directly rendering in root */}
      {/* In Next.js, we can render Navbar in page as well */}
      {/*  */}
      {/* HERO */}
      <section className="bg-white">
        {/* we render Navbar here to keep this page standalone */}
        {/* If layout already includes a header, it's okay to keep both minimal */}
        {/* Prefer single header; in real app, move Navbar to layout */}
        {/*  */}
        {/* Inline Navbar */}
        {/*  */}
      </section>
      {/* Standalone Navbar */}
      {/*  */}
      <Navbar />

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <h1 className="text-balance font-sans text-4xl font-bold text-slate-900 md:text-5xl">ECO METER</h1>
            <p className="text-balance font-sans text-lg text-slate-700">Where change counts.</p>
            <p className="font-sans leading-relaxed text-slate-700">
              Join a community that turns recyclable materials into measurable impact. Schedule pickups or drop-offs,
              track your contributions, earn recognition, and climb global and friends leaderboards.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded bg-blue-700 px-5 py-3 font-sans text-sm font-semibold text-white hover:bg-blue-800"
              >
                Get started
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded border border-teal-600 px-5 py-3 font-sans text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                View leaderboard
              </Link>
            </div>
            <ul className="grid gap-3 pt-4 text-sm text-slate-700 md:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600" aria-hidden />
                Schedule pickups or request drop-offs
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600" aria-hidden />
                Track materials and points
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600" aria-hidden />
                Global and friends leaderboards
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600" aria-hidden />
                Earn rewards and badges
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <img
              src="/illustration-of-recycling-community-pickup-and-lea.png"
              alt="Illustration of community recycling with pickups and leaderboard"
              className="h-auto w-full rounded"
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded bg-blue-700 p-4 text-center">
                <p className="text-xs text-blue-100">Total kg Recycled</p>
                <p className="text-2xl font-semibold text-white">12,480</p>
              </div>
              <div className="rounded bg-teal-600 p-4 text-center">
                <p className="text-xs text-teal-50">Active Participants</p>
                <p className="text-2xl font-semibold text-white">3,214</p>
              </div>
              <div className="rounded border border-gray-200 p-4 text-center">
                <p className="text-xs text-slate-600">Pickups Scheduled</p>
                <p className="text-2xl font-semibold text-slate-900">847</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

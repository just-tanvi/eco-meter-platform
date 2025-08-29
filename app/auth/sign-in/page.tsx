// app/auth/sign-in/page.tsx
// Basic email/password auth per Supabase guidelines

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SignInPage() {
  const supabase = getSupabaseBrowserClient()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = "/dashboard"
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          },
        })
        if (error) throw error
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-4 py-10">
        <Link href="/" className="text-sm text-blue-700 hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-sans text-2xl font-semibold text-slate-900">
          {mode === "sign-in" ? "Sign in to ECO METER" : "Create your ECO METER account"}
        </h1>
        <p className="mt-1 font-sans text-sm text-slate-700">Where change counts.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded bg-blue-700 px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            className="text-sm text-teal-700 hover:underline"
          >
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  )
}

"use client"

import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { display_name: displayName || "Melodix listener" },
      },
    })
    setLoading(false)
    setMessage(error ? "Impossible de créer le compte. Vérifiez vos informations." : "Compte créé. Vérifiez votre email pour confirmer l’accès.")
  }

  return <main className="auth-shell"><section className="auth-card"><div className="app-logo"><span className="logo-glyph">M</span><span>melodix</span></div><p className="eyebrow">CREATE YOUR ACCOUNT</p><h1>Start listening</h1><p className="muted">Save playlists, likes and history on every device.</p><form onSubmit={submit}><label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="auth-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button></form>{message && <p className="auth-message" role="status">{message}</p>}<a className="auth-switch" href="/auth/login">Already have an account? Sign in</a></section></main>
}

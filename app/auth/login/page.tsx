"use client"

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
    setBusy(false)
    if (result.error) { setMessage(result.error.message.toLowerCase().includes('confirm') ? 'Vérifiez votre email pour confirmer votre compte.' : 'Impossible de continuer. Vérifiez vos informations puis réessayez.'); return }
    window.location.href = mode === 'login' ? '/' : '/auth/login?created=1'
  }

  return <main className="auth-shell"><div className="auth-card"><div className="app-logo"><span className="logo-glyph">M</span><span>melodix</span></div><p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN MELODIX'}</p><h1>{mode === 'login' ? 'Your sound, everywhere.' : 'Make music yours.'}</h1><p className="muted">{mode === 'login' ? 'Sign in to sync your library and preferences.' : 'Create a free account to keep your music in sync.'}</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></label><button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create free account'}</button></form>{message && <p className="auth-message" role="status">{message}</p>}<button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'New to Melodix? Create an account' : 'Already have an account? Sign in'}</button></div></main>
}

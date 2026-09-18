"use client"

import { FormEvent, useState } from "react"

const providers = [
  { label: "Continue with Google", icon: <span className="google-icon" aria-hidden="true">G</span> },
  { label: "Continue with GitHub", icon: <span className="provider-icon github" aria-hidden="true">●</span> },
  { label: "Continue with ChatGPT", icon: <span className="provider-icon chatgpt" aria-hidden="true">◎</span> },
  { label: "Continue with SAML SSO", icon: <span className="provider-icon lock" aria-hidden="true">▢</span> },
  { label: "Continue with Passkey", icon: <span className="provider-icon passkey" aria-hidden="true">♧</span> },
]

export default function Home() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [showOptions, setShowOptions] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(email ? `A sign-in link is ready for ${email}.` : "Enter your email address to continue.")
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand-mark" href="/" aria-label="Melodix home"><span /></a>
        <button className="signup-button" type="button" onClick={() => setMessage("Create your Melodix account to get started.")}>Sign Up</button>
      </header>
      <section className="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Log in to Melodix</h1>
        <form onSubmit={submit} className="login-form">
          <label className="sr-only" htmlFor="email">Email Address</label>
          <input id="email" type="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          <button className="primary-button" type="submit">Continue with Email</button>
        </form>
        <div className="divider" aria-hidden="true" />
        <div className="provider-list">
          {providers.map((provider) => <button className="provider-button" type="button" key={provider.label} onClick={() => setMessage(`${provider.label} is not connected in this preview.`)}>{provider.icon}<span>{provider.label}</span></button>)}
        </div>
        <button className="options-button" type="button" aria-expanded={showOptions} onClick={() => setShowOptions(!showOptions)}>Show other options</button>
        {showOptions && <p className="options-note">More sign-in methods will appear here when your workspace is connected.</p>}
        {message && <p className="status-message" role="status">{message}</p>}
        <p className="account-prompt">Don&apos;t have an account? <button type="button" onClick={() => setMessage("Create your Melodix account to get started.")}>Sign Up</button></p>
      </section>
      <footer><a href="#terms">Terms</a><a href="#privacy">Privacy Policy</a></footer>
    </main>
  )
}

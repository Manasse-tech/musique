import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Melodix — Log in",
  description: "Sign in to your Melodix workspace.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}

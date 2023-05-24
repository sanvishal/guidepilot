import type { AppProps } from "next/app"

import { Toaster } from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"
import "@guidepilot/ui/styles/globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { interFont, satoshiFont } from "@/styles/fonts"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <main className={cn(satoshiFont.variable, interFont.variable)}>
        <Component {...pageProps} />
        <Toaster />
      </main>
    </AuthProvider>
  )
}

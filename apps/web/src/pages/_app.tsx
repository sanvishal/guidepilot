import type { AppProps } from "next/app"
import { cn } from "ui/lib/utils"

import { interFont, satoshiFont } from "../styles/fonts"
import "ui/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={cn(satoshiFont.variable, interFont.variable)}>
      <Component {...pageProps} />
    </main>
  )
}

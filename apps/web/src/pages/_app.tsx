import type { AppProps } from "next/app"
import Router from "next/router"
import NProgress from "nprogress"
import { QueryClient, QueryClientProvider } from "react-query"

import "nprogress/nprogress.css"
import { Toaster } from "@guidepilot/ui"
import { cn } from "@guidepilot/ui/lib/utils"
import "@guidepilot/ui/styles/globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { interFont, satoshiFont } from "@/styles/fonts"

Router.events.on("routeChangeStart", () => NProgress.start())
Router.events.on("routeChangeComplete", () => NProgress.done())
Router.events.on("routeChangeError", () => NProgress.done())

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className={cn(satoshiFont.variable, interFont.variable)}>
          <Component {...pageProps} />
          <Toaster />
        </main>
      </AuthProvider>
    </QueryClientProvider>
  )
}

import Head from "next/head"
import { ArrowRight } from "lucide-react"
import { Button } from "ui/Button"

export default function Home() {
  return (
    <main className="relative flex h-[100vh] w-full flex-col items-center justify-center text-center">
      <Head>
        <title>GuidePilot</title>
      </Head>
      <img
        src="logo.png"
        width="50px"
        height="50px"
        alt="logo of guidepilot"
        className="my-4"
      />
      <div className="font-display">
        <h1 className="text-2xl font-medium">GuidePilot</h1>
        <h5 className="text-muted-foreground text-base sm:text-lg">
          create beautiful and engaging guides effortlessly
        </h5>
      </div>
      <Button
        size="sm"
        className="animate-in fade-in-0 slide-in-from-bottom-2.5 ease-special my-10 duration-500"
      >
        Let&apos;s go
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage:
            "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAAXNSR0IArs4c6QAAAIpJREFUGFdj3D39Rcvvb/+F/nxlOODhwdD5/BOjwtsvDAcY9zd8Enn/9asjN/e/pw4+f+bdecXCz8PGOJ+RgYGBYVHsCzHfpOdcbAJM8YwMzPz/GRkXgyVA4P///SyfrrHzsTCysX/+zfoJLgGSXOr9UPAb+y9ulXcqL1Ak5gU+cPrHyKj6l+H/aQCpwjOUUBIQugAAAABJRU5ErkJggg==)",
        }}
      />
    </main>
  )
}

import Head from "next/head"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@guidepilot/ui/Button"
import { CenterPageWrapper } from "@/components/CenterPageWrapper"

export default function Home() {
  return (
    <CenterPageWrapper>
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
      <Link href="/signup" passHref>
        <Button
          size="sm"
          className="animate-in fade-in-0 slide-in-from-bottom-2.5 ease-special my-10 duration-500"
        >
          Let&apos;s go
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </CenterPageWrapper>
  )
}

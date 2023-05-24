import Head from "next/head"

import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Head>
        <title>GuidePilot • Home</title>
      </Head>
      <div className="px-3 md:container md:mx-auto">
        <Navbar />
        Welcome {user?.name}
      </div>
    </>
  )
}

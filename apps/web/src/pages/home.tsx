import { useEffect } from "react"
import Head from "next/head"
import { Permission, Role } from "appwrite"

import { Button } from "@guidepilot/ui"
import { COLLECTION, db, dbConfig } from "@/lib/appwrite"
import {
  useCreateGuideMutation,
  useListGuidesQuery,
} from "@/lib/hooks/guides.hooks"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const { user } = useAuth()

  const { data: guides } = useListGuidesQuery()

  const { mutate: createGuideMutation } = useCreateGuideMutation({
    userId: user?.$id,
    name: "something",
  })

  return (
    <>
      <Head>
        <title>GuidePilot • Home</title>
      </Head>
      <div className="px-3 md:container md:mx-auto">
        <Navbar />
        <div>
          Welcome {user?.name}
          <Button onClick={() => createGuideMutation()}>Create</Button>
          <div>
            {guides &&
              guides.map((guide) => {
                return (
                  <div key={guide.id}>
                    {guide.name} - {guide.userId}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </>
  )
}

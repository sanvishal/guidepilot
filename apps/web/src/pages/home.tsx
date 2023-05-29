import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Permission, Role } from "appwrite"
import { Loader, Plus } from "lucide-react"

import { Button } from "@guidepilot/ui"
import { COLLECTION, db, dbConfig } from "@/lib/appwrite"
import {
  useCreateGuideMutation,
  useListGuidesQuery,
} from "@/lib/hooks/guides.hooks"
import { GuideCard } from "@/components/GuideCard"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  const { data: guides, isFetching: isFetchingGuides } = useListGuidesQuery()

  const { mutate: createGuideMutation, isLoading: isCreatingGuide } =
    useCreateGuideMutation({
      userId: user?.$id,
      name: "Untitled Guide",
      blocks: [],
    })

  return (
    <>
      <Head>
        <title>GuidePilot • Home</title>
      </Head>
      <div className="px-3 md:container md:mx-auto">
        <Navbar />
        <div className="mt-5">
          {user ? (
            <>
              <div className="slide-in-from-bottom-2 fade-in-50 animate-in flex justify-between">
                <h1 className="font-display text-3xl font-medium">Guides</h1>
                <Button
                  size="lg"
                  className="shadow-lg"
                  onClick={() => createGuideMutation()}
                  disabled={isCreatingGuide}
                >
                  {isCreatingGuide ? (
                    <Loader className="mr-1 h-4 w-4 animate-spin stroke-[3px]" />
                  ) : (
                    <Plus className="mr-1 h-4 w-4 stroke-[3px]" />
                  )}
                  Create Guide
                </Button>
              </div>
              {isFetchingGuides ? (
                <div className="mt-28 flex w-full flex-col items-center justify-center">
                  <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : guides.length === 0 ? (
                <div className="slide-in-from-bottom-2 fade-in-50 animate-in mt-28 flex w-full flex-col items-center justify-center">
                  <img
                    src="/empty.png"
                    alt="empty state no guides"
                    className="w-1/3 opacity-90"
                  />
                  <p className="text-muted-foreground mb-6 mt-8 text-lg">
                    You don&apos;t have any guides yet, create one?
                  </p>
                  <Button
                    size="lg"
                    className="shadow-lg"
                    disabled={isCreatingGuide}
                    onClick={() => createGuideMutation()}
                  >
                    {isCreatingGuide ? (
                      <Loader className="mr-1 h-4 w-4 animate-spin stroke-[3px]" />
                    ) : (
                      <Plus className="mr-1 h-4 w-4 stroke-[3px]" />
                    )}
                    Create Guide
                  </Button>
                </div>
              ) : (
                <div className="slide-in-from-bottom-2 fade-in-50 animate-in mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                  {guides.map((guide) => {
                    return <GuideCard key={guide.id} guide={guide} />
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="mt-28 flex w-full flex-col items-center justify-center">
              <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { useRouter } from "next/router"
import { Guide, UnSerializedGuide, UnserializedGuideWithoutId } from "@/types"
import { AppwriteException, Models, Permission, Query, Role } from "appwrite"
import { useMutation, useQuery, useQueryClient } from "react-query"

import { useToast } from "@guidepilot/ui/lib/useToast"
import { useAuth } from "@/contexts/AuthContext"
import { COLLECTION, db, dbConfig } from "../appwrite"
import { grantReadWritePermission } from "../utils"

export const useListGuidesQuery = () => {
  const key = ["guides"]

  const { user } = useAuth()

  return useQuery<Guide[]>(
    key,
    async () => {
      const documents = await db.listDocuments(
        dbConfig.dbId,
        COLLECTION.GUIDES,
        [Query.equal("userId", user.$id)]
      )
      return documents.documents.map((document) => {
        return {
          id: document.$id,
          userId: document.userId,
          name: document.name,
          blocks: (document.blocks || []).map((block) => JSON.parse(block)),
          createdAt: document.$createdAt,
          updatedAt: document.$updatedAt,
        }
      })
    },
    { enabled: Boolean(user) }
  )
}

export const useCreateGuideMutation = (guide: UnserializedGuideWithoutId) => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation(
    () =>
      db.createDocument(
        dbConfig.dbId,
        COLLECTION.GUIDES,
        "unique()",
        guide,
        grantReadWritePermission(user?.$id)
      ),
    {
      onSuccess: (data) => {
        router.push(`/edit/${data.$id}`)
      },
      onError: (error: AppwriteException) => {
        toast({
          variant: "destructive",
          title: "An error occured!",
          description: error?.message || "",
        })
      },
    }
  )
}

export const useGetGuideByIdQuery = ({
  id,
  onSuccess,
}: {
  id: string
  onSuccess: (guide: Guide) => any
}) => {
  const key = ["guide", id]
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery<Guide, AppwriteException>(
    key,
    async () => {
      console.log(id)
      const document = await db.getDocument(
        dbConfig.dbId,
        COLLECTION.GUIDES,
        id
      )

      const guide: Guide = {
        id: document.$id,
        userId: document.userId,
        name: document.name,
        blocks: (document.blocks || []).map((block) => JSON.parse(block)),
        createdAt: document.$createdAt,
        updatedAt: document.$updatedAt,
      }

      return guide
    },
    {
      enabled: Boolean(user) && Boolean(id),
      onSuccess,
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "An error occured!",
          description: err?.message || "",
        })
      },
    }
  )
}

export const useSaveGuideMutation = (guide: Guide) => {
  return useMutation(() =>
    db.updateDocument(dbConfig.dbId, COLLECTION.GUIDES, guide.id, {
      blocks: guide.blocks.map((b) => JSON.stringify(b)),
    })
  )
}

export const useUpdateGuideName = ({ onSuccess }) => {
  const { toast } = useToast()

  return useMutation<
    Models.Document,
    AppwriteException,
    { name: string; id: string }
  >(
    ({ name, id }) =>
      db.updateDocument(dbConfig.dbId, COLLECTION.GUIDES, id, {
        name,
      }),
    {
      onSuccess: () => {
        toast({
          title: "Guide name updated",
        })
        onSuccess()
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "An error occured!",
          description: err?.message || "",
        })
      },
    }
  )
}

export const useDeleteGuideMutation = (id: string) => {
  return useMutation(() =>
    db.deleteDocument(dbConfig.dbId, COLLECTION.GUIDES, id)
  )
}

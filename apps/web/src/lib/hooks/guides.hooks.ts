import { Guide, GuideWithoutId } from "@/types"
import { Permission, Query, Role } from "appwrite"
import { useMutation, useQuery, useQueryClient } from "react-query"

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
        }
      })
    },
    { enabled: Boolean(user) }
  )
}

export const useCreateGuideMutation = (guide: GuideWithoutId) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation(
    () =>
      db.createDocument(dbConfig.dbId, COLLECTION.GUIDES, "unique()", guide, [
        Permission.read(Role.user(user?.$id)),
        Permission.write(Role.user(user?.$id)),
      ]),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["guides"])
      },
    }
  )
}

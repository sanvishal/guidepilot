import { Account, Client, Databases, Storage } from "appwrite"

const client = new Client()

if (
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT ||
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  !process.env.NEXT_PUBLIC_APPWRITE_DB
) {
  throw new Error("Appwrite project details not provided!")
}

const dbConfig = {
  dbId: process.env.NEXT_PUBLIC_APPWRITE_DB,
}

enum COLLECTION {
  GUIDES = "guides",
}

enum BUCKET {
  IMAGES = "guidepilot-images",
}

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)

const account = new Account(client)
const db = new Databases(client)
const storage = new Storage(client)

export { client, account, db, dbConfig, COLLECTION, storage, BUCKET }

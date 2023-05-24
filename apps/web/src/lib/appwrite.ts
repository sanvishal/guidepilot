import { Account, Client } from "appwrite"

const client = new Client()

if (
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT ||
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
) {
  throw new Error("Appwrite project details not provided!")
}

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)

const account = new Account(client)

export { client, account }

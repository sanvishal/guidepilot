import { useRouter } from "next/router"
import { LogOut } from "lucide-react"

import { account } from "@/lib/appwrite"

export const Navbar = () => {
  const router = useRouter()

  const logout = async () => {
    await account.deleteSession("current")
    window?.localStorage.removeItem("jwt")
    window?.localStorage.removeItem("jwt_expire")
    router.push("/login")
  }

  return (
    <nav className="flex h-16 w-full items-center justify-center py-2 md:h-20">
      <div className="flex h-full w-full items-center justify-between rounded-md">
        <div className="flex items-center space-x-2">
          <img
            src="logo.png"
            width="30px"
            height="30px"
            alt="logo of guidepilot"
            className="mx-auto my-6"
          />
          <h1 className="font-display text-xl font-semibold">GuidePilot</h1>
        </div>
        <div className="flex items-center">
          <LogOut onClick={() => logout()} />
        </div>
      </div>
    </nav>
  )
}

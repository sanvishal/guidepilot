import { useRouter } from "next/router"
import Avatar from "avvvatars-react"
import { ArrowDown, ChevronDown, Loader, LogOut } from "lucide-react"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@guidepilot/ui"
import { account } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"

export const Navbar = () => {
  const router = useRouter()
  // const { user } = useAuth()
  const user = {
    name: "abcd",
    email: "abc",
  }

  const handleLogout = async () => {
    await account.deleteSession("current")
    window?.localStorage.removeItem("jwt")
    window?.localStorage.removeItem("jwt_expire")
    router.push("/login")
  }

  return (
    <nav className="flex h-16 w-full items-center justify-center py-2">
      <div className="flex h-full w-full items-center justify-between rounded-md">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            width="30px"
            height="30px"
            alt="logo of guidepilot"
            className="mx-auto"
          />
          <h1 className="font-display text-xl font-semibold">GuidePilot</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="truncate">
              {user?.email ? (
                <>
                  <Avatar value={user?.email} style="shape" size={30} />
                  <span className="mx-2">{user?.name || ""}</span>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </>
              ) : (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-muted-foreground">
              {user?.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

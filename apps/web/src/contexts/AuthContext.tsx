import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/router"
import { Models } from "appwrite"

import { useToast } from "@guidepilot/ui/lib/useToast"
import { account, client } from "@/lib/appwrite"

type AuthContext = {
  user: Models.User<Models.Preferences> | null
  setUser: (user: AuthContext["user"]) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
  isLoading: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthContext["user"]>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { toast } = useToast()

  const handleUnauthorized = () => {
    toast({
      title: "Unauthorized!",
      description: "login to continue...",
      variant: "destructive",
    })

    router.push("/login")
  }

  useEffect(() => {
    const handleSession = async () => {
      try {
        setIsLoading(true)
        const currUser = await account.get()
        currUser ? setUser(currUser) : handleUnauthorized()
      } catch (e) {
        handleUnauthorized()
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    }

    if (!user && !["/login", "/signup", "/"].includes(router.pathname)) {
      handleSession()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

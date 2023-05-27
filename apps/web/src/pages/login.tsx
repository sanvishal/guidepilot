import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { zodResolver } from "@hookform/resolvers/zod"
import { AppwriteException } from "appwrite"
import { ArrowRight, AtSign, Key, Loader, Type } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from "@guidepilot/ui"
import { useToast } from "@guidepilot/ui/lib/useToast"
import { account } from "@/lib/appwrite"
import { CenterPageWrapper } from "@/components/CenterPageWrapper"
import { useAuth } from "@/contexts/AuthContext"

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "enter an email" })
    .email("enter a valid email"),
  password: z
    .string()
    .min(8, "password must be minimum 8 characters length")
    .max(100, "password must be maximum 100 characters length"),
})

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onFormSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      setIsLoading(true)
      await account.createEmailSession(values.email, values.password)
      const user = await account.get()
      setIsLoading(false)
      setUser(user)
      router.push("/home")
    } catch (e: unknown) {
      setIsLoading(false)
      toast({
        variant: "destructive",
        title: "An error occured!",
        description: (e as AppwriteException).message,
      })
    }
  }

  return (
    <CenterPageWrapper centered={false} withBg={false}>
      <Head>
        <title>GuidePilot • Login</title>
      </Head>
      <div className="mb-8 text-center">
        <img
          src="/logo.png"
          width="50px"
          height="50px"
          alt="logo of guidepilot"
          className="mx-auto my-6"
        />
        <div className="font-display">
          <h1 className="text-2xl font-medium">GuidePilot</h1>
          <h5 className="text-muted-foreground text-base sm:text-lg">Login</h5>
        </div>
      </div>
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(onFormSubmit)}
          className="w-full max-w-xs space-y-4"
        >
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your email id"
                    {...field}
                    icon={<AtSign />}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your password"
                    icon={<Key />}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              !loginForm.formState.isDirty || !loginForm.formState.isValid
            }
          >
            Login
            {isLoading ? (
              <Loader className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="ml-1 h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="flex flex-col items-center">
          <div className="text-muted-foreground my-4">or</div>
          <Link href="/signup" passHref>
            <Button variant="outline" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      </Form>
    </CenterPageWrapper>
  )
}

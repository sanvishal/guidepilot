import { useEffect, useState } from "react"
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
import { COLLECTION, account, db, dbConfig } from "@/lib/appwrite"
import { CenterPageWrapper } from "@/components/CenterPageWrapper"
import { useAuth } from "@/contexts/AuthContext"

const signupFormSchema = z
  .object({
    name: z.string().min(2).max(200),
    email: z
      .string()
      .min(1, { message: "enter an email" })
      .email("enter a valid email"),
    password: z
      .string()
      .min(8, "password must be minimum 8 characters length")
      .max(100, "password must be maximum 100 characters length"),
    passwordConfirm: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "passwords do not match",
    path: ["passwordConfirm"],
  })

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const signupForm = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  })

  const onFormSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    try {
      setIsLoading(true)
      const user = await account.create(
        "unique()",
        values.email,
        values.password,
        values.name
      )
      await account.createEmailSession(values.email, values.password)
      console.log(user)
      setIsLoading(false)
      toast({
        title: "Account created",
        description: "we have logged in for you",
      })
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
        <title>GuidePilot • Signup</title>
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
          <h5 className="text-muted-foreground text-base sm:text-lg">SignUp</h5>
        </div>
      </div>
      <Form {...signupForm}>
        <form
          onSubmit={signupForm.handleSubmit(onFormSubmit)}
          className="w-full max-w-xs space-y-4"
        >
          <FormField
            control={signupForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="your name" {...field} icon={<Type />} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
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
            control={signupForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Password
                  <FormDescription>minimum 8 characters</FormDescription>
                </FormLabel>
                <FormControl>
                  <Input placeholder="a password" icon={<Key />} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reenter password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="same password again"
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
              !signupForm.formState.isDirty || !signupForm.formState.isValid
            }
          >
            Signup
            {isLoading ? (
              <Loader className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="ml-1 h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="flex flex-col items-center">
          <div className="text-muted-foreground my-2">or</div>
          <Link href="/login" passHref>
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        </div>
      </Form>
    </CenterPageWrapper>
  )
}

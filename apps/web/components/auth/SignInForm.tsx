"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { Input } from "@kwitch/ui/components/input"
import { Button } from "@kwitch/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kwitch/ui/components/form"
import { Spinner } from "@kwitch/ui/components/spinner"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/provider/AuthProvider"
import { toast } from "@kwitch/ui/hooks/use-toast"

export const signInSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string(),
})

export default function SignInForm() {
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const { signIn } = useAuth()

  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true)
    const dst = searchParams.get("redirect") || "/channels"
    try {
      await signIn(values)
      router.replace(dst)
    } catch (err: any) {
      toast({
        title: "Failed to sign in",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-y-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='username' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder='password' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='bg-secondary dark:text-white w-full'
            disabled={loading}
          >
            {loading ? <Spinner size={"small"} /> : "Submit"}
          </Button>
        </form>
      </Form>
      <Button className='w-full' asChild>
        <Link href='/sign-up'>
          Don&apos;t have an account?&nbsp;<strong>Sign Up</strong>
        </Link>
      </Button>
    </div>
  )
}

"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { useRouter } from "next/navigation"
import React from "react"
import { Spinner } from "@kwitch/ui/components/spinner"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { useAuth } from "@/components/provider/AuthProvider"

export const signUpSchema = z
  .object({
    username: z.string().min(3).max(20),
    password: z
      .string()
      .regex(
        new RegExp(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/),
        "Password must contain at least 8 characters, including letters, numbers, and special characters.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function SignUpForm() {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true)
    try {
      await signUp({
        username: values.username,
        password: values.password,
      })
      toast({
        title: "Your sign up request is successful.",
        description: "You can sign in now.",
        variant: "success",
      })
      router.replace("/sign-in")
    } catch (err: any) {
      toast({
        title: "Your sign up request is failed.",
        description: "The id already exists.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
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
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder='confirm password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='bg-secondary dark:text-white'
          disabled={loading}
        >
          {loading ? <Spinner size={"small"} /> : "Submit"}
        </Button>
      </form>
    </Form>
  )
}

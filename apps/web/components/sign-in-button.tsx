import React from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInButton({ redirect }: { redirect?: string }) {
  redirect = redirect || "/"
  return (
    <Button asChild>
      <Link href={`/sign-in?redirect=${redirect}`}>Sign In</Link>
    </Button>
  )
}

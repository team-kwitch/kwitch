"use client"

import Loading from "@/components/loading"
import { LOCAL_STORAGE_KEYS } from "@/const/localStorage"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { useRouter } from "next/navigation"
import { use, useEffect } from "react"

export default function OAuth2CallbackPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const router = useRouter()
  const { accessToken } = use(searchParams)
  const { toast } = useToast()

  useEffect(() => {
    if (!accessToken || accessToken.length === 0) {
      toast({
        title: "Invalid access token",
        description: "Please try again",
        variant: "destructive",
      })
      return router.replace("/")
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    router.replace("/")
  }, [])

  return (
      <Loading />
  )
}

"use client"

import { LOCAL_STORAGE_KEYS } from "@/const/localStorage"
import { useAuth } from "@/provider/auth-provider"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function OAuth2CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams() || new URLSearchParams()
  const { toast } = useToast()

  const accessToken = searchParams.get("accessToken") || ""

  useEffect(() => {
    if (!accessToken && accessToken.length === 0) {
      toast({
        title: "Invalid access token",
        description: "Please try again",
        variant: "destructive",
      })
      return router.replace("/")
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    router.replace("/")
  })

  return null
}

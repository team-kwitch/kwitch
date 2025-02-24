"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"
import { useAuth } from "@/provider/auth-provider"
import { SocketProvider } from "@/provider/socket-provider"

export default function StreamManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in?redirect=/stream-manager")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  return <SocketProvider>{children}</SocketProvider>
}

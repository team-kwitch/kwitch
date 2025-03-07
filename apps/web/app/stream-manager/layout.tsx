"use client"

import React from "react"
import { SocketProvider } from "@/components/provider/socket-provider"

export default function StreamManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocketProvider>{children}</SocketProvider>
}

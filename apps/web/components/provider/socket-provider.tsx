"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { LOCAL_STORAGE_KEYS } from "@/lib/const/localStorage"
import { API_URL } from "@/lib/env"

interface SocketContextValue {
  socket: Socket | null
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const accessToken =
      localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN) || ""
    const newSocket = io(API_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        accessToken: `Bearer ${accessToken}`,
      },
    })

    setSocket(newSocket)

    return () => {
      setTimeout(() => {
        newSocket.close()
      }, 3000)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket(): { socket: Socket | null } {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return { socket: context.socket }
}

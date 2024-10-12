"use client"

import { SOCKET_URL } from "@/utils/env"
import { createContext, useContext, useEffect, useRef } from "react"
import { Socket, io } from "socket.io-client"
import { useAuth } from "./auth-provider"
import { CustomResponse } from "@kwitch/types"

const SocketContext = createContext<Socket | undefined>(undefined)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()

  const socketRef = useRef<Socket>(
    io(SOCKET_URL, {
      path: "/socket.io/",
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    }),
  )

  useEffect(() => {
    if (user) {
      socketRef.current.connect()
    }

    return () => {
      socketRef.current.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const videoOptions = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
}

const useSocket = () => {
  const socket = useContext(SocketContext)

  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider")
  }

  const emitAsync = (event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      socket.emit(event, data, (response: CustomResponse) => {
        console.log("Socket response: ", response)
        if (response.success === false) {
          reject(new Error(response.error))
        } else {
          resolve(response.content)
        }
      })
    })
  }

  return {
    socket,
    emitAsync,
  }
}

export { SocketProvider, useSocket }

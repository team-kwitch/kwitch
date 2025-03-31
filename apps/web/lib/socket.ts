"use client"

import { io, Socket } from "socket.io-client"
import { API_URL } from "./env"

export const socket: Socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket"],
})

import { Server, Socket } from "socket.io"
import * as express from "express"

import { Chat, CustomResponse, User } from "@kwitch/domain"

import {
  endStreaming,
  getStreaming,
  joinStreaming,
  leaveStreaming,
  startStreaming,
} from "#/socket/services/streaming.service.js"
import { filterSentence } from "#/socket/utils/chat-filter.js"

export const registerStreamingHandler = (io: Server, socket: Socket) => {
  const request = socket.request as express.Request
  const user = request.user as User

  socket.on(
    "streamings:start",
    async (title: string, cb: (response: CustomResponse) => void) => {
      const { streaming, rtpCapabilities } = await startStreaming({
        title,
        user,
      })
      socket.join(streaming.roomId)
      console.log(
        `Streaming started by ${user.username}: ${streaming.roomId}/${title}`,
      )
      cb({ success: true, content: { rtpCapabilities } })
    },
  )

  socket.on("streamings:end", (cb: (response: CustomResponse) => void) => {
    try {
      const { streaming } = endStreaming({
        channelId: user.channel.id,
      })
      io.to(streaming.roomId).emit("streamings:destroy")
      socket.leave(streaming.roomId)
      console.log(`Streaming ended: ${streaming.roomId}/${streaming.title}`)
      cb({ success: true })
    } catch (err: any) {
      cb({ success: false, error: err.message })
    }
  })

  socket.on(
    "streamings:join",
    (channelId: string, cb: (response: CustomResponse) => void) => {
      try {
        const { streaming, rtpCapabilities } = joinStreaming({
          channelId,
        })
        socket.join(streaming.roomId)
        io.to(streaming.roomId).emit("streamings:joined", user.username)
        console.log(
          `${user.username} joined ${streaming.roomId}/${streaming.title}`,
        )
        cb({ success: true, content: { streaming, rtpCapabilities } })
      } catch (err: any) {
        cb({ success: false, error: err.message })
      }
    },
  )

  socket.on("streamings:leave", (channelId: string) => {
    try {
      const { streaming } = leaveStreaming({
        channelId,
        viewerSocketId: socket.id,
      })
      io.to(streaming.roomId).emit("streamings:left", user.username)
      socket.leave(streaming.roomId)
      console.log(
        `${user.username} left ${streaming.roomId}/${streaming.title}`,
      )
    } catch (err: any) {
      console.warn("Failed to leave streaming", err)
    }
  })

  socket.on("chats:send", (channelId: string, message: string) => {
    const filteredMessage = filterSentence(message)
    const chat: Chat = {
      username: user.username,
      message: filteredMessage,
      isStreamer: channelId === user.channel.id,
    }

    const streaming = getStreaming(channelId)

    io.to(streaming.roomId).emit("chats:sent", chat)
    console.log(
      `${user.username} sent "${message}" to ${streaming.roomId}/${streaming.title}`,
    )
  })
}

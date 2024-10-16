import assert from "assert"
import { inject, injectable } from "inversify"
import { Server, Socket } from "socket.io"
import { Request } from "express"

import { Chat, CustomResponse } from "@kwitch/domain"

import { TYPES } from "@/constant/types.js"

import { StreamingService } from "../services/StreamingService.js"
import { filterSentence } from "../utils/ChatFilter.js"
import { SocketHandler } from "./SocketHandler.js"

@injectable()
export class StreamingHandler implements SocketHandler {
  private readonly streamingService: StreamingService

  constructor(
    @inject(TYPES.StreamingService) streamingService: StreamingService,
  ) {
    this.streamingService = streamingService
  }

  public register(io: Server, socket: Socket) {
    const { user } = socket.request as Request

    assert(user, "[socket] unauthorized user connected")

    socket.on(
      "streamings:start",
      async (title: string, done: (response: CustomResponse) => void) => {
        const { rtpCapabilities } = await this.streamingService.startStreaming(
          user.channel.id,
          title,
        )
        socket.join(user.channel.id)
        console.log(
          `[socket] [streamings:start] streaming started: ${user.channel.id}/${title}`,
        )
        done({ success: true, content: { rtpCapabilities } })
      },
    )

    socket.on(
      "streamings:end",
      async (done: (response: CustomResponse) => void) => {
        try {
          const streaming = await this.streamingService.endStreaming(
            user.channel.id,
          )
          io.to(streaming.channelId).emit("streamings:destroy")
          socket.leave(streaming.channelId)
          console.log(
            `[socket] [streamings:end] streaming ended: ${streaming.title}`,
          )
          done({ success: true })
        } catch (err: any) {
          done({ success: false, error: err.message })
        }
      },
    )

    socket.on(
      "streamings:join",
      async (channelId: string, done: (response: CustomResponse) => void) => {
        try {
          const { streaming, rtpCapabilities } =
            await this.streamingService.joinStreaming(channelId)
          socket.join(channelId)
          io.to(channelId).emit("streamings:joined", user.username)
          console.log(
            `[socket] [streamings:join] ${user.username} joined ${channelId}/${streaming.title}`,
          )
          done({ success: true, content: { rtpCapabilities } })
        } catch (err: any) {
          done({ success: false, error: err.message })
        }
      },
    )

    socket.on("streamings:leave", async (channelId: string) => {
      const streaming = await this.streamingService.leaveStreaming(
        channelId,
        socket.id,
      )
      io.to(channelId).emit("streamings:left", user.username)
      socket.leave(channelId)
      console.log(
        `[socket] [streamings:leave] ${user.username} left ${channelId}/${streaming.title}`,
      )
    })

    socket.on("chats:send", async (channelId: string, message: string) => {
      const filteredMessage = filterSentence(message)
      const chat: Chat = {
        username: user.username,
        message: filteredMessage,
        isStreamer: channelId === user.channel.id,
      }

      io.to(channelId).emit("chats:sent", chat)
      console.log(
        `[socket] [chats:send] ${user.username} sent "${message}" to ${channelId}}`,
      )
    })
  }
}

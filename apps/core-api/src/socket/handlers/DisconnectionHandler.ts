import { inject, injectable } from "inversify"
import { Server, Socket } from "socket.io"
import { Request } from "express"
import assert from "node:assert"

import { TYPES } from "#constant/types.js"
import { StreamingService } from "#services/StreamingService.js"

import { SocketHandler } from "./SocketHandler.js"

@injectable()
export class DisconnectingHandler implements SocketHandler {
  private readonly streamingService: StreamingService

  constructor(
    @inject(TYPES.StreamingService) streamingService: StreamingService,
  ) {
    this.streamingService = streamingService
  }

  public register(io: Server, socket: Socket): void {
    const { user } = socket.request as Request

    assert(user, "[socket] unauthorized user connected")

    socket.on("disconnecting", async () => {
      console.log(
        `[socket] [disconnection] user disconnected: ${user}/${socket.id}`,
      )

      const channelIds = Array.from(socket.rooms).filter(
        (room) => room !== socket.id,
      )

      for (const channelId of channelIds) {
        const streaming = this.streamingService.getStreaming(channelId)

        if (user.channel.id === streaming.channelId) {
          await this.streamingService.endStreaming(channelId)
          io.to(channelId).emit("streamings:destroy")
          console.log(
            `[socket] [streamings:end] streaming ended: ${streaming.title}`,
          )
        } else {
          await this.streamingService.leaveStreaming(channelId, socket.id)
          io.to(channelId).emit("streamings:left", user.username)
          console.log(
            `[socket] [streamings:end] ${user.username} left ${channelId}/${streaming.title}`,
          )
        }
      }
    })
  }
}

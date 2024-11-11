import { Server, Socket } from "socket.io"
import { Request } from "express"

import {
  endStreaming,
  getStreaming,
  leaveStreaming,
} from "../services/streaming.service.js"

export const registerDisconnectionHandler = (
  io: Server,
  socket: Socket,
): void => {
  const request = socket.request as Request
  const user = request.user!

  socket.on("disconnecting", async () => {
    console.log(`[socket] [disconnection] socket disconnected: ${socket.id}`)

    const channelIds = Array.from(socket.rooms).filter(
      (room) => room !== socket.id,
    )

    for (const channelId of channelIds) {
      const streaming = getStreaming(channelId)

      if (user.channel.id === streaming.roomId) {
        endStreaming({ channelId })
        io.to(streaming.roomId).emit("streamings:destroy")
        console.log(`Streaming ended: ${streaming.roomId}/${streaming.title}`)
      } else {
        leaveStreaming({
          channelId,
          viewerSocketId: socket.id,
        })
        io.to(channelId).emit("streamings:left", user.username)
        console.log(
          `${user.username} left ${streaming.roomId}/${streaming.title}`,
        )
      }
    }
  })
}

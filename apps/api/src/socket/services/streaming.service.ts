import mediasoup from "mediasoup"

import { MediasoupStreaming } from "#/socket/domain/streaming.js"
import { getWorker } from "./worker.service.js"
import { User } from "@kwitch/domain"
import { AppError } from "#/error/app.error.js"

const streamings = new Map<string, MediasoupStreaming>() // Map<channelId, DefaultStreaming>

export const startStreaming = async ({
  title,
  user,
}: {
  title: string
  user: User
}): Promise<{
  streaming: MediasoupStreaming
  rtpCapabilities: mediasoup.types.RtpCapabilities
}> => {
  const isOnLive = streamings.has(user.channel.id)
  if (isOnLive) {
    throw new AppError({
      statusCode: 400,
      message: "Streaming is already on live.",
    })
  }

  const worker = getWorker()
  const streaming = await MediasoupStreaming.create({
    worker,
    title,
    roomId: user.channel.id,
    streamer: user,
  })
  streamings.set(user.channel.id, streaming)

  return {
    streaming,
    rtpCapabilities: streaming.router.rtpCapabilities,
  }
}

export const joinStreaming = ({
  channelId,
}: {
  channelId: string
}): {
  streaming: MediasoupStreaming
  rtpCapabilities: mediasoup.types.RtpCapabilities
} => {
  const streaming = getStreaming(channelId)
  if (!streaming) {
    throw new AppError({
      statusCode: 404,
      message: "Streaming not found.",
    })
  }
  streaming.addViewer()
  return {
    streaming,
    rtpCapabilities: streaming.router.rtpCapabilities,
  }
}

export const endStreaming = ({
  channelId,
}: {
  channelId: string
}): {
  streaming: MediasoupStreaming
} => {
  const streaming = getStreaming(channelId)
  if (!streaming) {
    throw new AppError({
      statusCode: 404,
      message: "Streaming not found.",
    })
  }
  streaming.destroy()
  streamings.delete(channelId)
  return { streaming }
}

export const leaveStreaming = ({
  channelId,
  viewerSocketId,
}: {
  channelId: string
  viewerSocketId: string
}): {
  streaming: MediasoupStreaming
} => {
  const streaming = getStreaming(channelId)
  if (!streaming) {
    throw new AppError({
      statusCode: 404,
      message: "Streaming not found.",
    })
  }
  streaming.removeViewer(viewerSocketId)
  return { streaming }
}

export const getStreaming = (channelId: string): MediasoupStreaming | null => {
  const streaming = streamings.get(channelId)
  if (!streaming) {
    return null
  }
  return streaming
}

export const getStreamings = (): MediasoupStreaming[] => {
  return Array.from(streamings.values())
}

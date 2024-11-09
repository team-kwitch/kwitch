import { injectable } from "inversify"

import { LiveChannel } from "@kwitch/domain"

import { prisma } from "#lib/prisma.js"
import { redis } from "#lib/redis.js"
import { Streaming } from "#socket/domain/Streaming.js"

@injectable()
export class StreamingService {
  private readonly channelRepository = prisma.channel
  private readonly streamings: Map<string, Streaming> = new Map() // Map<channelId, Streaming>

  async startStreaming(channelId: string, title: string) {
    const isOnLive = this.streamings.has(channelId)
    if (isOnLive) {
      throw new Error("Streaming is already on live.")
    }

    const channel = await this.channelRepository.findFirstOrThrow({
      where: {
        id: channelId,
      },
    })
    const streaming = await Streaming.create(channel.id, title)

    const router = streaming.getRouter()
    const rtpCapabilities = router.rtpCapabilities
    streaming.title = title
    this.streamings.set(channelId, streaming)

    const liveChannel: LiveChannel = {
      title,
      channel,
      viewerCount: 0,
    }
    redis.hset(`live-channels:${channelId}`, {
      title: liveChannel.title,
      channel: JSON.stringify(liveChannel.channel),
      viewerCount: liveChannel.viewerCount.toString(),
    })

    return {
      rtpCapabilities,
    }
  }

  async joinStreaming(channelId: string) {
    const streaming = this.getStreaming(channelId)
    const router = streaming.getRouter()
    const rtpCapabilities = router.rtpCapabilities

    redis.hincrby(`live-channels:${channelId}`, "viewerCount", 1)

    return {
      streaming,
      rtpCapabilities,
    }
  }

  async endStreaming(channelId: string) {
    const streaming = this.getStreaming(channelId)
    streaming.end()
    this.streamings.delete(channelId)

    redis.del(`live-channels:${channelId}`)

    return streaming
  }

  async leaveStreaming(channelId: string, socketId: string) {
    const streaming = this.getStreaming(channelId)
    streaming.removeViewer(socketId)
    redis.hincrby(`live-channels:${channelId}`, "viewerCount", -1)

    return streaming
  }

  public getStreaming(channelId: string): Streaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new Error("Streaming is not on live.")
    }
    return streaming
  }

  public getStreamings(): Streaming[] {
    return Array.from(this.streamings.values())
  }
}

import { injectable } from "inversify"

import { ChannelRepository } from "@kwitch/db-connection/repository"
import { LiveChannel } from "@kwitch/domain"
import { redis } from "@kwitch/db-connection/redis"

import { Streaming } from "../models/Streaming.js"

@injectable()
export class StreamingService {
  // Map<channelId, Streaming>
  private readonly streamings: Map<string, Streaming> = new Map()

  async startStreaming(channelId: string, title: string) {
    const isOnLive = this.streamings.has(channelId)
    if (isOnLive) {
      throw new Error("Streaming is already on live.")
    }

    const channel = await ChannelRepository
      .createQueryBuilder("channel")
      .where({
        id: channelId,
      })
      .getOneOrFail()
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

  public getStreaming(channelId: string) {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new Error("Streaming is not found.")
    }
    return streaming
  }

  public getStreamings() {
    return Array.from(this.streamings.values())
  }
}

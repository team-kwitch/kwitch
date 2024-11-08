import { injectable } from "inversify"

import { LiveChannel, User } from "@kwitch/domain"
import { prismaClient } from "@kwitch/db-core"

import { redis } from "@kwitch/db-redis"

@injectable()
export class ChannelService {
  private readonly channelRepository = prismaClient.channel

  public async getLiveChannels() {
    let curCursor = "0"
    const liveChannels: LiveChannel[] = []

    do {
      const [nxtCursor, keys] = await redis.scan(
        curCursor,
        "MATCH",
        "live-channels:*",
      )
      curCursor = nxtCursor

      for (const key of keys) {
        const liveChannelData = await redis.hgetall(key)
        const liveChannel: LiveChannel = {
          title: liveChannelData.title,
          channel: JSON.parse(liveChannelData.channel),
          viewerCount: parseInt(liveChannelData.viewerCount, 10),
        }
        liveChannels.push(liveChannel)
      }
    } while (curCursor !== "0")

    return liveChannels
  }

  public async getChannelByUserId(userId: number) {
    const channel = await this.channelRepository.findFirstOrThrow({
      where: {
        ownerId: userId,
      },
    })

    return channel
  }

  public async getChannelById(channelId: string) {
    const channel = await this.channelRepository.findFirstOrThrow({
      where: {
        id: channelId,
      },
    })

    return channel
  }
}

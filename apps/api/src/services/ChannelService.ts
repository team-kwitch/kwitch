import { injectable } from "inversify"

import { ChannelRepository } from "@kwitch/db-connection/repository"
import { redis } from "@kwitch/db-connection/redis"
import { LiveChannel, User } from "@kwitch/domain"

@injectable()
export class ChannelService {
  public async createChannel(user: User) {
    const createdChannel = await ChannelRepository.create({
      name: `${user.username}'s channel`,
    })

    return createdChannel
  }

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
    const channel = await ChannelRepository
      .createQueryBuilder("channel")
      .where("channel.userId = :userId", { userId })
      .getOneOrFail()

    return channel
  }

  public async getChannelById(channelId: string) {
    const channel = await ChannelRepository
      .createQueryBuilder("channel")
      .where("channel.id = :channelId", { channelId })
      .getOneOrFail()

    return channel
  }
}

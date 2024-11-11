import { injectable } from "inversify"

import { ChannelRepository } from "@kwitch/database/repository"
import { redis } from "@kwitch/database/redis"
import { User } from "@kwitch/domain"

@injectable()
export class ChannelService {
  public async createChannel(user: User) {
    const createdChannel = await ChannelRepository.create({
      name: `${user.username}'s channel`,
    })

    return createdChannel
  }

  public async getChannelByUserId(userId: number) {
    const channel = await ChannelRepository.createQueryBuilder("channel")
      .where("channel.userId = :userId", { userId })
      .getOneOrFail()

    return channel
  }

  public async getChannelById(channelId: string) {
    const channel = await ChannelRepository.createQueryBuilder("channel")
      .where("channel.id = :channelId", { channelId })
      .getOneOrFail()

    return channel
  }
}

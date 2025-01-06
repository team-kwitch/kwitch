import { injectable } from "inversify"

import { ChannelRepository } from "@kwitch/database/repository"
import { User } from "@kwitch/domain"
import { AppError } from "#/error/app.error.js"

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
      .getOne()

    if (!channel) {
      throw new AppError({
        statusCode: 404,
        message: "Channel not found.",
      })
    }

    return channel
  }

  public async getChannelById(channelId: string) {
    const channel = await ChannelRepository.createQueryBuilder("channel")
      .where("channel.id = :channelId", { channelId })
      .getOne()

    if (!channel) {
      throw new AppError({
        statusCode: 404,
        message: "Channel not found.",
      })
    }

    return channel
  }
}

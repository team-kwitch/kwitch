import { injectable } from "inversify";

import { prisma } from "@kwitch/db";
import { User } from "@kwitch/types";

@injectable()
export class ChannelService {
  public getChannelKey(channelId: string) {
    return `channel:${channelId}`;
  }

  public async createChannel(user: User) {
    const createdChannel = await prisma.channel.create({
      data: {
        name: `${user.username}'s channel`,
        ownerId: user.id,
      },
    });

    return createdChannel;
  }

  public async getChannelByUserId(userId: number) {
    const channel = await prisma.channel.findFirstOrThrow({
      where: {
        ownerId: userId,
      },
    });

    return channel;
  }

  public async getChannelById(channelId: string) {
    const channel = await prisma.channel.findFirstOrThrow({
      where: {
        id: channelId,
      },
    });

    return channel;
  }
}

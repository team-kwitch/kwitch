import { injectable } from "inversify";

import { prisma, redisClient } from "@kwitch/db";
import { LiveChannel, User } from "@kwitch/types";

@injectable()
export class ChannelService {
  public async createChannel(user: User) {
    const createdChannel = await prisma.channel.create({
      data: {
        name: `${user.username}'s channel`,
        ownerId: user.id,
      },
    });

    return createdChannel;
  }

  public async getLiveChannels() {
    let curCursor = 0;
    const liveChannels: LiveChannel[] = [];

    do {
      const { cursor: nxtCursor, keys } = await redisClient.SCAN(curCursor, {
        MATCH: "live-channels:*",
      });
      curCursor = nxtCursor;

      for (const key of keys) {
        const liveChannelData = await redisClient.HGETALL(key);
        const liveChannel: LiveChannel = {
          title: liveChannelData.title,
          channel: JSON.parse(liveChannelData.channel),
          viewerCount: parseInt(liveChannelData.viewerCount, 10),
        };
        liveChannels.push(liveChannel);
      }
    } while (curCursor !== 0);

    return liveChannels;
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

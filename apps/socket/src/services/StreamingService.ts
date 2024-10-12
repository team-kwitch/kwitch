import { injectable } from "inversify";

import { prisma, redisClient } from "@kwitch/db";
import { LiveChannel } from "@kwitch/types";

import { Streaming } from "../models/Streaming";

@injectable()
export class StreamingService {
  // Map<channelId, Streaming>
  private readonly streamings: Map<string, Streaming> = new Map();

  async startStreaming(channelId: string, title: string) {
    const isOnLive = this.streamings.has(channelId);
    if (isOnLive) {
      throw new Error("Streaming is already on live.");
    }

    const channel = await prisma.channel.findFirstOrThrow({
      where: {
        id: channelId,
      },
    });
    const streaming = await Streaming.create(channel.id, title);

    const router = streaming.getRouter();
    const rtpCapabilities = router.rtpCapabilities;
    streaming.title = title;
    this.streamings.set(channelId, streaming);

    const liveChannel: LiveChannel = {
      title,
      channel,
      viewerCount: 0,
    };
    redisClient.HSET(`live-channels:${channelId}`, {
      title: liveChannel.title,
      channel: JSON.stringify(liveChannel.channel),
      viewerCount: liveChannel.viewerCount.toString(),
    });

    return {
      rtpCapabilities,
    };
  }

  async joinStreaming(channelId: string) {
    const streaming = this.getStreaming(channelId);
    const router = streaming.getRouter();
    const rtpCapabilities = router.rtpCapabilities;

    redisClient.HINCRBY(`live-channels:${channelId}`, "viewerCount", 1);

    return {
      streaming,
      rtpCapabilities,
    };
  }

  async endStreaming(channelId: string) {
    const streaming = this.getStreaming(channelId);
    streaming.end();
    this.streamings.delete(channelId);

    redisClient.DEL(`live-channels:${channelId}`);

    return streaming;
  }

  async leaveStreaming(channelId: string, socketId: string) {
    const streaming = this.getStreaming(channelId);
    if (!streaming) {
      return;
    }
    streaming.removeViewer(socketId);

    redisClient.HINCRBY(`live-channels:${channelId}`, "viewerCount", -1);

    return streaming;
  }

  public getStreaming(channelId: string) {
    const streaming = this.streamings.get(channelId);
    if (!streaming) {
      throw new Error("Streaming is not found.");
    }
    return streaming;
  }

  public getStreamings() {
    return Array.from(this.streamings.values());
  }
}

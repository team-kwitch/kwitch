import { Service } from "typedi";

import { Streaming } from "../models/Streaming";

@Service()
export class StreamingService {
  // Map<channelId, Streaming>
  private readonly streamings: Map<string, Streaming> = new Map();

  async startStreaming(channelId: string, title: string) {
    const streaming = await Streaming.create(channelId);

    if (this.getStreaming(channelId)) {
      throw new Error("Streaming already exists.");
    }

    const router = streaming.getRouter();
    const rtpCapabilities = router.rtpCapabilities;
    streaming.title = title;
    this.streamings.set(channelId, streaming);

    return {
      rtpCapabilities,
    };
  }

  async joinStreaming(channelId: string) {
    const streaming = this.getStreaming(channelId);
    const router = streaming.getRouter();
    const rtpCapabilities = router.rtpCapabilities;

    // TODO: increase viewer count

    return {
      streaming,
      rtpCapabilities,
    };
  }

  public getStreaming(channelId: string) {
    if (!this.streamings.has(channelId)) {
      throw new Error("Streaming not found.");
    }
    return this.streamings.get(channelId);
  }

  public getStreamings() {
    return Array.from(this.streamings.values());
  }
}

import { Service } from "typedi";

import { Streaming } from "../models/Streaming";

@Service()
export class StreamingService {
  // Map<channelId, Streaming>
  private readonly streamings: Map<string, Streaming> = new Map();

  async startStreaming(channelId: string, title: string) {
    const streaming = await Streaming.create(channelId, title);

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
    const streaming = this.streamings.get(channelId);
    if (!streaming) {
      throw new Error("Streaming not found.");
    }
    return streaming;
  }

  public getStreamings() {
    return Array.from(this.streamings.values());
  }
}

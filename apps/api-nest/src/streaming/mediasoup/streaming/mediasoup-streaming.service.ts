import * as mediasoup from "mediasoup"
import { Streaming } from "@kwitch/domain"
import { WsException } from "@nestjs/websockets"
import { Injectable } from "@nestjs/common"
import { StreamingService } from "src/streaming/interfaces/streaming.service.interface"
import { WorkerService } from "../worker/worker.service"
import { StartStreamingDto } from "src/streaming/dto/start-streaming.dto"
import { UpdateStreamingDto } from "src/streaming/dto/update-streaming.dto"
import { MediasoupStreaming } from "../interfaces/mediasoup-streaming.interface"
import { mediasoupConfigs } from "../config"

@Injectable()
export class MediasoupStreamingService implements StreamingService {
  private readonly streamings: Map<string, MediasoupStreaming> = new Map()

  constructor(private readonly workerService: WorkerService) {}

  async start({
    startStreamingDto,
    channelId,
    socketId,
  }: {
    startStreamingDto: StartStreamingDto
    channelId: string
    socketId: string
  }): Promise<MediasoupStreaming> {
    const isOnLive = this.streamings.has(channelId)
    if (isOnLive) {
      throw new WsException("Streaming is already on live.")
    }

    const worker = this.workerService.getWorker()
    const streaming = new MediasoupStreaming({
      router: await worker.createRouter(
        mediasoupConfigs.routerOptions as mediasoup.types.RouterOptions,
      ),
      webRtcServer: worker.appData.webRtcServer as mediasoup.types.WebRtcServer,
      title: startStreamingDto.title,
      channelId,
      roomId: `${channelId}-${socketId}`,
    })
    this.streamings.set(channelId, streaming)

    return streaming
  }

  findAll(): MediasoupStreaming[] {
    return Array.from(this.streamings.values())
  }

  findOne({ channelId }: { channelId: string }): MediasoupStreaming | null {
    return this.streamings.get(channelId) || null
  }

  update({
    updateStreamingDto,
  }: {
    updateStreamingDto: UpdateStreamingDto
  }): MediasoupStreaming {
    const streaming = this.streamings.get(updateStreamingDto.channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.updateInfo({
      title: updateStreamingDto.title,
    })
    return streaming
  }

  end({ channelId }: { channelId: string }): MediasoupStreaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.destroy()
    this.streamings.delete(channelId)
    return streaming
  }

  join({ channelId }: { channelId: string }): MediasoupStreaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.addViewer()
    return streaming
  }

  leave({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }): MediasoupStreaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.removeViewer({ viewerSocketId })
    return streaming
  }
}

import * as mediasoup from "mediasoup"
import { WsException } from "@nestjs/websockets"
import { Injectable } from "@nestjs/common"
import { StreamingService } from "src/streaming/streaming.service.interface"
import { WorkerService } from "./worker.service"
import { StartStreamingDto } from "src/streaming/dto/start-streaming.dto"
import { UpdateStreamingDto } from "src/streaming/dto/update-streaming.dto"
import { MediasoupStreaming } from "./mediasoup-streaming"
import { mediasoupConfigs } from "./config"
import { User } from "@kwitch/types"

@Injectable()
export class MediasoupStreamingService implements StreamingService {
  private readonly streamings: Map<string, MediasoupStreaming> = new Map()

  constructor(private readonly workerService: WorkerService) {}

  async start({
    startStreamingDto,
    socketId,
    streamer,
  }: {
    startStreamingDto: StartStreamingDto
    socketId: string
    streamer: User
  }): Promise<MediasoupStreaming> {
    const isOnLive = this.streamings.has(streamer.channel.id)
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
      roomId: `${streamer.channel.id}-${socketId}`,
      streamer,
    })
    this.streamings.set(streamer.channel.id, streaming)

    return streaming
  }

  findAll(): MediasoupStreaming[] {
    return Array.from(this.streamings.values())
  }

  findById(channelId: string): MediasoupStreaming | null {
    return this.streamings.get(channelId) || null
  }

  update(updateStreamingDto: UpdateStreamingDto): MediasoupStreaming {
    const streaming = this.streamings.get(updateStreamingDto.channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.updateInfo({
      title: updateStreamingDto.title,
    })
    return streaming
  }

  end(channelId: string): MediasoupStreaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.destroy()
    this.streamings.delete(channelId)
    return streaming
  }

  join(channelId: string): MediasoupStreaming {
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

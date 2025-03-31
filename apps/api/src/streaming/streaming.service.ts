import * as mediasoup from "mediasoup"
import { WsException } from "@nestjs/websockets"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { StartStreamingDto } from "src/streaming/dto/start-streaming.dto"
import { UpdateStreamingDto } from "src/streaming/dto/update-streaming.dto"
import { MediasoupStreaming } from "./mediasoup-streaming"
import { User } from "@kwitch/types"
import { type ConfigType } from "@nestjs/config"
import { mediasoupConfigs } from "src/config/mediasoup.config"
import { WorkerService } from "./worker.service"

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name)
  private readonly streamings: Map<string, MediasoupStreaming> = new Map()

  constructor(
    private readonly workerService: WorkerService,

    @Inject(mediasoupConfigs.KEY)
    private readonly config: ConfigType<typeof mediasoupConfigs>,
  ) {}

  findAll(): MediasoupStreaming[] {
    return Array.from(this.streamings.values())
  }

  findById(channelId: string): MediasoupStreaming | null {
    return this.streamings.get(channelId) || null
  }

  async start({
    startStreamingDto,
    socketId,
    streamer,
  }: {
    startStreamingDto: StartStreamingDto
    socketId: string
    streamer: User
  }) {
    const isOnLive = this.streamings.has(streamer.channel.id)
    if (isOnLive) {
      throw new WsException("Streaming is already on live.")
    }

    const worker = this.workerService.getWorker()
    const streaming = new MediasoupStreaming({
      router: await worker.createRouter(this.config.routerOptions),
      webRtcServer: worker.appData.webRtcServer as mediasoup.types.WebRtcServer,
      title: startStreamingDto.title,
      layout: startStreamingDto.layout,
      roomId: `${streamer.channel.id}\\${socketId}`,
      streamer,
    })
    this.streamings.set(streamer.channel.id, streaming)

    return streaming
  }

  update({
    updateStreamingDto,
    channelId,
  }: {
    updateStreamingDto: UpdateStreamingDto
    channelId: string
  }): MediasoupStreaming {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    streaming.updateInfo({
      title: updateStreamingDto.title,
      layout: updateStreamingDto.layout,
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

  join({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }) {
    const streaming = this.streamings.get(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    streaming.addViewer({ viewerSocketId })

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

  async createConsumer({
    viewerSocketId,
    streaming,
    producer,
  }: {
    viewerSocketId: string
    streaming: MediasoupStreaming
    producer: mediasoup.types.Producer
  }) {
    if (!streaming.receivers.has(viewerSocketId)) {
      throw new WsException("Viewer not found.")
    }

    const viewer = streaming.receivers.get(viewerSocketId)

    if (!viewer) {
      throw new WsException("Viewer not found.")
    }

    if (
      !streaming.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: viewer.rtpCapabilities!,
      })
    ) {
      return
    }

    let newConsumer: mediasoup.types.Consumer

    try {
      newConsumer = await viewer.recvTransport!.consume({
        producerId: producer.id,
        rtpCapabilities: viewer.rtpCapabilities!,
      })

      viewer.consumers.set(newConsumer.id, newConsumer)

      newConsumer.on("transportclose", () => {
        this.logger.debug("")
        viewer.consumers.delete(newConsumer.id)
      })

      newConsumer.on("producerclose", () => {
        viewer.consumers.delete(newConsumer.id)
      })

      newConsumer.on("producerpause", () => {
        newConsumer.pause()
      })

      newConsumer.on("producerresume", () => {
        newConsumer.resume()
      })
    } catch (err: any) {
      this.logger.warn(`createConsumer(), transport.consume() failed:${err}`)
      throw new WsException("Failed to create consumer.")
    }

    return newConsumer
  }
}

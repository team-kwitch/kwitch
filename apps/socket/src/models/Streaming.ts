import * as mediasoup from "mediasoup"

import { MEDIASOUP_CONFIG } from "@/config/mediasoup.config"

import { getWorker } from "./Worker"

export interface Viewer {
  recvTransport: mediasoup.types.WebRtcTransport | null
  consumers: Map<string, mediasoup.types.Consumer> // Map<consumerId, Consumer>
}

export interface Streamer {
  sendTransport: mediasoup.types.WebRtcTransport | null
  producers: Map<string, mediasoup.types.Producer> // Map<producerId, Producer>
}

export interface StreamingOptions {
  router: mediasoup.types.Router
  channelId: string
  title: string
}

export class Streaming {
  private readonly router: mediasoup.types.Router
  private readonly streamer: Streamer
  private readonly viewers: Map<string, Viewer> // Map<socketId, Peer>

  public title: string
  public channelId: string

  private constructor({ router, channelId, title }: StreamingOptions) {
    this.router = router
    this.channelId = channelId
    this.title = title
    this.streamer = {
      sendTransport: null,
      producers: new Map(),
    }
    this.viewers = new Map()
  }

  public static async create(channelId: string, title: string) {
    const worker = getWorker()
    const { routerOptions } = MEDIASOUP_CONFIG
    const router = await worker.createRouter(
      routerOptions as mediasoup.types.RouterOptions,
    )

    return new Streaming({
      router,
      channelId,
      title,
    })
  }

  public getRouter() {
    return this.router
  }

  public getChannelId() {
    return this.channelId
  }

  public getSendTransport() {
    if (!this.streamer.sendTransport) {
      throw new Error(
        "[socket] [Streaming.getSendTransport] sendTransport not found",
      )
    }
    return this.streamer.sendTransport
  }

  public getRecvTransport(socketId: string) {
    const viewer = this.viewers.get(socketId)
    if (!viewer) {
      throw new Error("[socket] [Streaming.getRecvTransport] viewer not found")
    }
    if (!viewer.recvTransport) {
      throw new Error(
        "[socket] [Streaming.getRecvTransport] recvTransport not found",
      )
    }
    return viewer.recvTransport
  }

  public getProducer(producerId: string) {
    const producer = this.streamer.producers.get(producerId)
    if (!producer) {
      throw new Error("[socket] [Streaming.getProducer] producer not found")
    }
    return producer
  }

  public getConsumer(socketId: string, consumerId: string) {
    const viewer = this.viewers.get(socketId)
    if (!viewer) {
      throw new Error("[socket] [Streaming.getConsumer] viewer not found")
    }
    const consumer = viewer.consumers.get(consumerId)
    if (!consumer) {
      throw new Error("[socket] [Streaming.getConsumer] consumer not found")
    }
    return consumer
  }

  public getProducerIds() {
    return Array.from(this.streamer.producers.keys())
  }

  public setSendTransport(transport: mediasoup.types.WebRtcTransport) {
    this.streamer.sendTransport = transport
  }

  public setRecvTransport(
    socketId: string,
    transport: mediasoup.types.WebRtcTransport,
  ) {
    if (!this.viewers.has(socketId)) {
      this.viewers.set(socketId, { recvTransport: null, consumers: new Map() })
    }
    const viewer = this.viewers.get(socketId)
    if (!viewer) {
      throw new Error("[socket] [Streaming.setRecvTransport] viewer not found")
    }
    viewer.recvTransport = transport
  }

  public addProducer(producer: mediasoup.types.Producer) {
    this.streamer.producers.set(producer.id, producer)
  }

  public addConsumer(socketId: string, consumer: mediasoup.types.Consumer) {
    if (!this.viewers.has(socketId)) {
      this.viewers.set(socketId, { recvTransport: null, consumers: new Map() })
    }
    const viewer = this.viewers.get(socketId)
    if (!viewer) {
      throw new Error("[socket] [Streaming.addConsumer] viewer not found")
    }
    viewer.consumers.set(consumer.id, consumer)
  }

  public end() {
    this.streamer.sendTransport?.close()
    this.streamer.producers.forEach((producer) => {
      producer.close()
    })
    this.viewers.forEach((viewer) => {
      viewer.recvTransport?.close()
      viewer.consumers.forEach((consumer) => {
        consumer.close()
      })
    })
    this.router.close()
  }

  public removeViewer(socketId: string) {
    this.viewers.get(socketId)?.recvTransport?.close()
    this.viewers.get(socketId)?.consumers.forEach((consumer) => {
      consumer.close()
    })
    this.viewers.delete(socketId)
  }
}

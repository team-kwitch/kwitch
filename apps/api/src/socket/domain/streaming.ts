import * as mediasoup from "mediasoup"

import { Streaming, User } from "@kwitch/domain"
import { mediasoupConfigs } from "../libs/mediasoup.js"

export interface Receiver {
  recvTransport: mediasoup.types.WebRtcTransport | null
  consumers: mediasoup.types.Consumer[]
}

export interface Sender {
  sendTransport: mediasoup.types.WebRtcTransport | null
  producers: mediasoup.types.Producer[]
}

export class MediasoupStreaming implements Omit<Streaming, "viewerCount"> {
  public readonly router: mediasoup.types.Router
  public readonly webRtcServer: mediasoup.types.WebRtcServer

  public readonly sender: Sender
  public readonly receivers: Map<string, Receiver>

  public title: string
  public roomId: string
  public streamer: User

  private constructor({
    router,
    webRtcServer,
    title,
    roomId,
    streamer,
  }: {
    router: mediasoup.types.Router
    webRtcServer: mediasoup.types.WebRtcServer
    title: string
    roomId: string
    streamer: User
  }) {
    this.router = router
    this.webRtcServer = webRtcServer
    this.sender = {
      sendTransport: null,
      producers: [],
    }
    this.receivers = new Map()
    this.title = title
    this.roomId = roomId
    this.streamer = streamer
  }

  public static async create({
    worker,
    title,
    roomId,
    streamer,
  }: {
    worker: mediasoup.types.Worker
    title: string
    roomId: string
    streamer: User
  }): Promise<MediasoupStreaming> {
    const routerOptions =
      mediasoupConfigs.routerOptions as mediasoup.types.RouterOptions
    return new MediasoupStreaming({
      router: await worker.createRouter(routerOptions),
      webRtcServer: worker.appData.webRtcServer as mediasoup.types.WebRtcServer,
      title,
      roomId,
      streamer,
    })
  }

  public destroy() {
    this.sender.sendTransport?.close()
    this.sender.producers.forEach((producer) => {
      producer.close()
    })
    this.receivers.forEach((viewer) => {
      viewer.recvTransport?.close()
      viewer.consumers.forEach((consumer) => {
        consumer.close()
      })
    })
    this.router.close()
  }

  public removeViewer(viewerSocketId: string) {
    const viewer = this.receivers.get(viewerSocketId)
    if (!viewer) {
      return
    }

    viewer.recvTransport?.close()
    viewer.consumers.forEach((consumer) => {
      consumer.close()
    })

    this.receivers.delete(viewerSocketId)
  }
}

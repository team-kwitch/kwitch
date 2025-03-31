import * as mediasoup from "mediasoup"
import type { Streaming, StreamingLayout, User } from "@kwitch/types"

export interface Receiver {
  rtpCapabilities: mediasoup.types.RtpCapabilities | null
  recvTransport: mediasoup.types.WebRtcTransport | null
  consumers: Map<string, mediasoup.types.Consumer>
}

export interface Sender {
  sendTransport: mediasoup.types.WebRtcTransport | null
  producers: Map<String, mediasoup.types.Producer>
}

export class MediasoupStreaming implements Streaming {
  public readonly router: mediasoup.types.Router
  public readonly webRtcServer: mediasoup.types.WebRtcServer

  public readonly sender: Sender
  public readonly receivers: Map<string, Receiver>

  title: string
  viewerCount: number
  layout: StreamingLayout
  readonly roomId: string
  readonly streamer: User

  constructor({
    router,
    webRtcServer,
    title,
    layout,
    roomId,
    streamer,
  }: {
    router: mediasoup.types.Router
    webRtcServer: mediasoup.types.WebRtcServer
    title: string
    layout: StreamingLayout
    roomId: string
    streamer: User
  }) {
    this.router = router
    this.webRtcServer = webRtcServer

    this.sender = {
      sendTransport: null,
      producers: new Map(),
    }
    this.receivers = new Map()

    this.title = title
    this.layout = layout
    this.streamer = streamer
    this.roomId = roomId
    this.viewerCount = 0
  }

  updateInfo({
    title,
    layout,
  }: {
    title?: string
    layout?: StreamingLayout
  }): void {
    if (title) {
      this.title = title
    }

    if (layout) {
      this.layout = layout
    }
  }

  addViewer({ viewerSocketId }: { viewerSocketId: string }): void {
    const newViewer: Receiver = {
      rtpCapabilities: null,
      recvTransport: null,
      consumers: new Map(),
    }
    this.receivers.set(viewerSocketId, newViewer)
    this.viewerCount++
  }

  removeViewer({ viewerSocketId }: { viewerSocketId: string }): void {
    const viewer = this.receivers.get(viewerSocketId)
    if (!viewer) {
      return
    }

    viewer.recvTransport?.close()
    viewer.consumers.forEach((consumer) => {
      consumer.close()
    })

    this.receivers.delete(viewerSocketId)

    this.viewerCount--
  }

  destroy(): void {
    this.sender.producers.forEach((producer) => {
      producer.close()
    })
    this.sender.sendTransport?.close()
    this.receivers.forEach((viewer) => {
      viewer.consumers.forEach((consumer) => {
        consumer.close()
      })
      viewer.recvTransport?.close()
    })
    this.router.close()
  }
}

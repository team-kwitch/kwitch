import * as mediasoup from "mediasoup"
import { Channel, Streaming, User } from "@kwitch/types"

export interface Receiver {
  recvTransport: mediasoup.types.WebRtcTransport | null
  consumers: mediasoup.types.Consumer[]
}

export interface Sender {
  sendTransport: mediasoup.types.WebRtcTransport | null
  producers: mediasoup.types.Producer[]
}

export class MediasoupStreaming implements Streaming {
  public readonly router: mediasoup.types.Router
  public readonly webRtcServer: mediasoup.types.WebRtcServer

  public readonly sender: Sender
  public readonly receivers: Map<string, Receiver>

  title: string
  viewerCount: number
  readonly roomId: string
  readonly streamer: User
  readonly rtpCapabilities: RTCRtpCapabilities

  constructor({
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
    this.rtpCapabilities = router.rtpCapabilities as RTCRtpCapabilities

    this.sender = {
      sendTransport: null,
      producers: [],
    }
    this.receivers = new Map()

    this.title = title
    this.streamer = streamer
    this.roomId = roomId
    this.viewerCount = 0
  }

  updateInfo({ title }: { title: string }): void {
    this.title = title
  }

  addViewer({ viewerSocketId }: { viewerSocketId: string }): void {
    this.receivers.set(viewerSocketId, {
      recvTransport: null,
      consumers: [],
    })
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

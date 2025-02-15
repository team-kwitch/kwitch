import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
  WsResponse,
} from "@nestjs/websockets"
import {
  EVENT_MEDIASOUP_CONNECT_TRANSPORT,
  EVENT_MEDIASOUP_CONSUMER,
  EVENT_MEDIASOUP_CREATE_TRANSPORT,
  EVENT_MEDIASOUP_GETALL_PRODUCER,
  EVENT_MEDIASOUP_PRODUCER,
  EVENT_MEDIASOUP_RESUME_CONSUMER,
} from "./constant"
import { Socket } from "socket.io"
import { Inject, Logger, UseGuards } from "@nestjs/common"
import { ISTREAMING_SERVICE } from "../constant"
import { MediasoupStreamingService } from "./mediasoup-streaming.service"
import mediasoup from "mediasoup"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"
import { RtpCapabilities } from "mediasoup/node/lib/RtpParameters"

@WebSocketGateway()
export class MediasoupGateway {
  private readonly logger = new Logger(MediasoupGateway.name)

  constructor(
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: MediasoupStreamingService,
  ) {}

  @SubscribeMessage(EVENT_MEDIASOUP_CREATE_TRANSPORT)
  async createTransport(
    @MessageBody()
    { channelId, isSender }: { channelId: string; isSender: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Is this a producer request? ${isSender}`)

    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const transport = await streaming.router.createWebRtcTransport({
      webRtcServer: streaming.webRtcServer,
    })

    transport.on("icestatechange", (iceState) => {
      if (iceState === "disconnected" || iceState === "closed") {
        this.logger.warn(
          `WebRtcTransport "icestatechange" event [iceState:${iceState}], socket disconnect`,
        )

        client.disconnect()
      }
    })

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "failed" || dtlsState === "closed") {
        this.logger.warn(
          `WebRtcTransport dtlsstatechange event [dtlsState: ${dtlsState}], socket disconnect`,
        )
        client.disconnect()
      }
    })

    if (isSender) {
      streaming.sender.sendTransport = transport
    } else {
      streaming.receivers.set(client.id, {
        recvTransport: transport,
        consumers: [],
      })
    }

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    }
  }

  @SubscribeMessage(EVENT_MEDIASOUP_CONNECT_TRANSPORT)
  async connectTransport(
    @MessageBody()
    {
      channelId,
      dtlsParameters,
      isSender,
    }: {
      channelId: string
      dtlsParameters: mediasoup.types.DtlsParameters
      isSender: boolean
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `DTLS parameters: \n${JSON.stringify(dtlsParameters, null, 2)}`,
    )
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const transport = isSender
      ? streaming.sender.sendTransport
      : streaming.receivers.get(client.id).recvTransport

    await transport.connect({
      dtlsParameters,
    })
  }

  @SubscribeMessage(EVENT_MEDIASOUP_PRODUCER)
  async createProducer(
    @MessageBody()
    {
      channelId,
      kind,
      rtpParameters,
    }: {
      channelId: string
      kind: mediasoup.types.MediaKind
      rtpParameters: mediasoup.types.RtpParameters
    },
  ) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const producer = await streaming.sender.sendTransport.produce({
      kind,
      rtpParameters,
    })
    this.logger.log(`Procuder Created. \n${JSON.stringify(producer, null, 2)}`)

    producer.on("transportclose", () => {
      this.logger.log("Producer's transport closed")
    })

    streaming.sender.producers.push(producer)
    return {
      id: producer.id,
      kind: producer.kind,
      rtpParameters: producer.rtpParameters,
    }
  }

  @SubscribeMessage(EVENT_MEDIASOUP_CONSUMER)
  async createConsumer(
    @MessageBody()
    {
      channelId,
      producerId,
      rtpCapabilities,
    }: {
      channelId: string
      producerId: string
      rtpCapabilities: RtpCapabilities
    },
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const router = streaming.router
    const producer = streaming.sender.producers.find(
      (producer) => producer.id === producerId,
    )

    if (!producer) {
      throw new WsException("Producer not found.")
    }

    if (router.canConsume({ producerId: producer.id, rtpCapabilities })) {
      const consumer = await streaming.receivers
        .get(client.id)
        .recvTransport.consume({
          producerId,
          rtpCapabilities,
        })
      this.logger.log(
        `Consumer created. id: ${consumer.id}, kind: ${consumer.kind}`,
      )

      streaming.receivers.get(client.id).consumers.push(consumer)

      consumer.on("transportclose", () => {
        this.logger.log("Consumer's transport closed")
      })

      consumer.on("producerclose", () => {
        console.log("producer closed")
      })

      return {
        id: consumer.id,
        producerId: producer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      }
    }
  }

  @SubscribeMessage(EVENT_MEDIASOUP_RESUME_CONSUMER)
  async resumeConsumer(
    @MessageBody()
    {
      channelId,
      consumerId,
    }: {
      channelId: string
      consumerId: string
    },
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const consumer = streaming.receivers
      .get(client.id)
      .consumers.find((c) => c.id === consumerId)
    if (!consumer) {
      throw new WsException("Consumer not found.")
    }

    await consumer.resume()
  }

  @SubscribeMessage(EVENT_MEDIASOUP_GETALL_PRODUCER)
  getAllProducer(@MessageBody() channelId: string) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }
    return streaming.sender.producers.map((producer) => producer.id)
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from "@nestjs/websockets"
import {
  EVENT_MEDIASOUP_CONNECT_TRANSPORT,
  EVENT_MEDIASOUP_CONSUMER,
  EVENT_MEDIASOUP_CREATE_TRANSPORT,
  EVENT_MEDIASOUP_PRODUCER,
  EVENT_MEDIASOUP_RESUME_CONSUMER,
} from "./constant"
import { Socket } from "socket.io"
import { Inject, Logger } from "@nestjs/common"
import { ISTREAMING_SERVICE } from "../constant"
import { MediasoupStreaming } from "./interfaces/mediasoup-streaming.interface"
import { MediasoupStreamingService } from "./streaming/mediasoup-streaming.service"
import * as mediasoup from "mediasoup"

@WebSocketGateway()
export class MediasoupGateway {
  private readonly logger = new Logger(MediasoupGateway.name)
  private readonly streamingMap = new Map<string, MediasoupStreaming>()

  constructor(private readonly streamingService: MediasoupStreamingService) {}

  @SubscribeMessage(EVENT_MEDIASOUP_CREATE_TRANSPORT)
  async createTransport(
    @MessageBody()
    { channelId, isSender }: { channelId: string; isSender: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log("Is this a producer request?", isSender)

    const streaming = this.streamingService.findOne({
      channelId,
    })
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
    this.logger.log("DTLS parameters...", { dtlsParameters })
    const streaming = this.streamingService.findOne({
      channelId,
    })
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
      producerOptions,
    }: {
      channelId: string
      producerOptions: mediasoup.types.ProducerOptions
    },
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findOne({
      channelId,
    })
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const { kind, rtpParameters } = producerOptions
    const producer = await streaming.sender.sendTransport.produce({
      kind,
      rtpParameters,
    })

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
      consumerOptions,
    }: {
      channelId: string
      consumerOptions: mediasoup.types.ConsumerOptions
    },
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findOne({
      channelId,
    })
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const { producerId, rtpCapabilities } = consumerOptions
    const router = streaming.router
    const producer = streaming.sender.producers.find((p) => p.id === producerId)
    if (!producer) {
      throw new WsException("Producer not found.")
    }

    if (router.canConsume({ producerId, rtpCapabilities })) {
      const consumer = await streaming.receivers
        .get(client.id)
        .recvTransport.consume({
          producerId,
          rtpCapabilities,
        })

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

    throw new WsException("Cannot consume")
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
    const streaming = this.streamingService.findOne({
      channelId,
    })
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
}

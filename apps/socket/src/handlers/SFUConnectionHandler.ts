import { inject, injectable } from "inversify"
import * as mediasoup from "mediasoup"
import { Server, Socket } from "socket.io"

import { CustomResponse } from "@kwitch/domain"

import { MEDIASOUP_CONFIG } from "@/config/mediasoup.config.js"
import { TYPES } from "@/constant/types.js"

import { StreamingService } from "../services/StreamingService.js"
import { SocketHandler } from "./SocketHandler.js"

@injectable()
export class SFUConnectionHandler implements SocketHandler {
  public readonly streamingService: StreamingService

  constructor(
    @inject(TYPES.StreamingService) streamingService: StreamingService,
  ) {
    this.streamingService = streamingService
  }

  public register(io: Server, socket: Socket) {
    const createTransport = async (
      router: mediasoup.types.Router,
    ): Promise<mediasoup.types.WebRtcTransport> => {
      const { transportOptions } = MEDIASOUP_CONFIG
      const transport = await router.createWebRtcTransport(
        transportOptions as mediasoup.types.WebRtcTransportOptions,
      )
      console.log(`transport ID: ${transport.id}`)

      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "closed") {
          console.log("transport closed")
        }
      })

      return transport
    }

    socket.on(
      "sfu:create-transport",
      async (
        { channelId, isSender }: { channelId: string; isSender: boolean },
        done: (response: CustomResponse) => void,
      ) => {
        console.log("Is this a producer request?", isSender)
        const streaming = this.streamingService.getStreaming(channelId)
        const router = streaming.getRouter()

        try {
          const transport = await createTransport(router)
          if (isSender) {
            streaming.setSendTransport(transport)
          } else {
            streaming.setRecvTransport(socket.id, transport)
          }
          done({
            success: true,
            content: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          })
        } catch (err: any) {
          console.error("Error creating transport:", err)
          done({ success: false, error: err.message })
        }
      },
    )

    socket.on(
      "sfu:send-transport-connect",
      async ({
        channelId,
        dtlsParameters,
      }: {
        channelId: string
        dtlsParameters: mediasoup.types.DtlsParameters
      }) => {
        console.log("DTLS PARAMS...", { dtlsParameters })
        const streaming = this.streamingService.getStreaming(channelId)
        const sendTransport = streaming.getSendTransport()
        sendTransport.connect({ dtlsParameters })
      },
    )

    socket.on(
      "sfu:recv-transport-connect",
      async ({
        channelId,
        dtlsParameters,
      }: {
        channelId: string
        dtlsParameters: mediasoup.types.DtlsParameters
      }) => {
        console.log("DTLS PARAMS...", { dtlsParameters })
        const streaming = this.streamingService.getStreaming(channelId)
        const recvTransport = streaming.getRecvTransport(socket.id)
        recvTransport.connect({ dtlsParameters })
      },
    )

    socket.on(
      "sfu:transport-produce",
      async (
        {
          channelId,
          producerOptions,
        }: {
          channelId: string
          producerOptions: mediasoup.types.ProducerOptions
        },
        done: (response: CustomResponse) => void,
      ) => {
        try {
          const streaming = this.streamingService.getStreaming(channelId)

          const { kind, rtpParameters } = producerOptions
          const sendTransport = streaming.getSendTransport()
          const producer = await sendTransport.produce({
            kind,
            rtpParameters,
          })

          console.log(`producer ID: ${producer.id}, kind: ${producer.kind}`)

          producer.on("transportclose", () => {
            console.log("producer transport closed")
          })

          streaming.addProducer(producer)

          done({ success: true, content: { id: producer.id } })
        } catch (err: any) {
          console.error("Error creating producer:", err)
          done({ success: false, error: err.message })
        }
      },
    )

    socket.on(
      "sfu:transport-consume",
      async (
        {
          channelId,
          producerId,
          rtpCapabilities,
        }: {
          channelId: string
          producerId: string
          rtpCapabilities: mediasoup.types.RtpCapabilities
        },
        done: (response: CustomResponse) => void,
      ) => {
        try {
          const streaming = this.streamingService.getStreaming(channelId)
          const router = streaming.getRouter()
          const producer = streaming.getProducer(producerId)
          const recvTransport = streaming.getRecvTransport(socket.id)

          if (router.canConsume({ producerId: producer.id, rtpCapabilities })) {
            const consumer = await recvTransport.consume({
              producerId: producer.id,
              rtpCapabilities,
              paused: true,
            })

            consumer.on("transportclose", () => {
              console.log("consumer transport closed")
            })

            consumer.on("producerclose", () => {
              console.log("producer closed")
            })

            streaming.addConsumer(socket.id, consumer)

            done({
              success: true,
              content: {
                id: consumer.id,
                producerId: producer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
              },
            })
          }
        } catch (err: any) {
          console.error(err)
          done({
            success: false,
            error: err.message,
          })
        }
      },
    )

    socket.on(
      "sfu:consumer-resume",
      async ({
        channelId,
        consumerId,
      }: {
        channelId: string
        consumerId: string
      }) => {
        console.log(
          `[consumer-resume] channelId: ${channelId}, socketId: ${socket.id}`,
        )
        const streaming = this.streamingService.getStreaming(channelId)
        const consumer = streaming.getConsumer(socket.id, consumerId)
        await consumer.resume()
      },
    )

    socket.on(
      "sfu:get-producers",
      async ({ channelId }: { channelId: string }, done) => {
        const streaming = this.streamingService.getStreaming(channelId)
        const producerIdMapIterator = streaming.getProducerIds()
        const producerIds = Array.from(producerIdMapIterator)
        done({ success: true, content: { producerIds } })
      },
    )
  }
}

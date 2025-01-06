import * as mediasoup from "mediasoup"
import { Server, Socket } from "socket.io"

import { CustomResponse } from "@kwitch/domain"

import { getStreaming } from "../services/streaming.service.js"

export const registerSfuConnectionHandler = (io: Server, socket: Socket) => {
  socket.on(
    "sfu:create-transport",
    async (
      { channelId, isSender }: { channelId: string; isSender: boolean },
      cb: (response: CustomResponse) => void,
    ) => {
      console.log("Is this a producer request?", isSender)

      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }

      const transport = await streaming.router.createWebRtcTransport({
        webRtcServer: streaming.webRtcServer,
      })

      transport.on("icestatechange", (iceState) => {
        if (iceState === "disconnected" || iceState === "closed") {
          console.warn(
            `WebRtcTransport "icestatechange" event [iceState:${iceState}], socket disconnect`,
          )

          socket.disconnect()
        }
      })

      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "failed" || dtlsState === "closed") {
          console.warn(
            `WebRtcTransport dtlsstatechange event [dtlsState: ${dtlsState}], socket disconnect`,
          )
          socket.disconnect()
        }
      })

      if (isSender) {
        streaming.sender.sendTransport = transport
      } else {
        streaming.receivers.set(socket.id, {
          recvTransport: transport,
          consumers: [],
        })
      }

      cb({
        success: true,
        content: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      })
    },
  )

  socket.on(
    "sfu:send-transport-connect",
    async (
      {
        channelId,
        dtlsParameters,
      }: {
        channelId: string
        dtlsParameters: mediasoup.types.DtlsParameters
      },
      cb: (response: CustomResponse) => void,
    ) => {
      console.log("DTLS PARAMS...", { dtlsParameters })

      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }
      const sendTransport = streaming.sender.sendTransport
      sendTransport!.connect({ dtlsParameters })
    },
  )

  socket.on(
    "sfu:recv-transport-connect",
    async (
      {
        channelId,
        dtlsParameters,
      }: {
        channelId: string
        dtlsParameters: mediasoup.types.DtlsParameters
      },
      cb: (response: CustomResponse) => void,
    ) => {
      console.log("DTLS PARAMS...", { dtlsParameters })
      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }
      streaming.receivers
        .get(socket.id)!
        .recvTransport!.connect({ dtlsParameters })
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
      cb: (response: CustomResponse) => void,
    ) => {
      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }

      const { kind, rtpParameters } = producerOptions
      const producer = await streaming.sender.sendTransport!.produce({
        kind,
        rtpParameters,
      })

      streaming.sender.producers.push(producer)

      producer.on("transportclose", () => {
        console.log("producer transport closed")
      })

      cb({ success: true, content: { id: producer.id } })
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
      cb: (response: CustomResponse) => void,
    ) => {
      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }

      const router = streaming.router
      const producer = streaming.sender.producers.find(
        (producer) => producer.id === producerId,
      )!

      const viewer = streaming.receivers.get(socket.id)!
      const recvTransport = viewer.recvTransport!

      if (router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        const consumer = await recvTransport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: true,
        })

        viewer.consumers.push(consumer)

        consumer.on("transportclose", () => {
          console.log("consumer transport closed")
        })

        consumer.on("producerclose", () => {
          console.log("producer closed")
        })

        cb({
          success: true,
          content: {
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          },
        })
      }
    },
  )

  socket.on(
    "sfu:consumer-resume",
    async (
      {
        channelId,
        consumerId,
      }: {
        channelId: string
        consumerId: string
      },
      cb: (response: CustomResponse) => void,
    ) => {
      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }

      const consumer = streaming.receivers
        .get(socket.id)!
        .consumers.find((consumer) => consumer.id === consumerId)!
      await consumer.resume()
    },
  )

  socket.on(
    "sfu:get-producers",
    async ({ channelId }: { channelId: string }, cb) => {
      const streaming = getStreaming(channelId)
      if (!streaming) {
        return cb({ success: false, error: "Streaming not found." })
      }
      const producerIds = streaming.sender.producers.map(
        (producer) => producer.id,
      )
      cb({ success: true, content: { producerIds } })
    },
  )
}

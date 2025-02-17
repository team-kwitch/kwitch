import { Socket } from "socket.io-client"
import * as mediasoup from "mediasoup-client"
import { User } from "@kwitch/types"
import { SOCKET_EVENTS } from "@/const/socket"

export const createDevice = async (
  rtpCapabilities: mediasoup.types.RtpCapabilities,
) => {
  const device = new mediasoup.Device()
  await device.load({ routerRtpCapabilities: rtpCapabilities })
  return device
}

export const createTransport = async ({
  socket,
  user,
  device,
  isSender,
}: {
  socket: Socket
  user: User
  device: mediasoup.types.Device
  isSender: boolean
}): Promise<mediasoup.types.Transport> => {
  return new Promise((resolve, reject) => {
    socket.emit(
      SOCKET_EVENTS.MEDIASOUP_CREATE_TRANSPORT,
      {
        channelId: user.channel.id,
        isSender,
      },
      (
        _transportOptions: Pick<
          mediasoup.types.TransportOptions,
          "id" | "iceParameters" | "iceCandidates" | "dtlsParameters"
        >,
      ) => {
        console.log("Transport options: ", _transportOptions)

        const transport = device.createSendTransport(_transportOptions)

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit(SOCKET_EVENTS.MEDIASOUP_CONNECT_TRANSPORT, {
              channelId: user.channel.id,
              dtlsParameters,
              isSender: true,
            })
            callback()
          } catch (err: any) {
            errback(err)
          }
        })

        isSender &&
          transport.on("produce", async (parameters, callback, errback) => {
            try {
              socket.emit(
                SOCKET_EVENTS.MEDIASOUP_PRODUCER,
                {
                  channelId: user.channel.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                },
                (producer: mediasoup.types.Producer) => {
                  callback({ id: producer.id })
                },
              )
            } catch (err: any) {
              errback(err)
            }
          })

        resolve(transport)
      },
    )
  })
}

export const createProducer = async ({
  transport,
  producerOptions,
}: {
  transport: mediasoup.types.Transport
  producerOptions: mediasoup.types.ProducerOptions
}) => {
  const producer = await transport.produce(producerOptions)

  producer.on("transportclose", () => {
    console.log("Producer Transport Closed")
  })

  producer.on("trackended", () => {
    console.log("Producer Track Ended")
  })

  return producer
}

"use client"

import { useEffect, useState, useRef } from "react"

import Chat from "@/components/channels/chat"
import { useToast } from "@/components/ui/use-toast"
import { SignalSlashIcon } from "@heroicons/react/24/solid"
import { useParams } from "next/navigation"
import * as mediasoup from "mediasoup-client"
import assert from "assert"
import { Streaming } from "@kwitch/types"
import { StreamingInfo } from "@/components/channels/streaming-info"
import { SOCKET_EVENTS } from "@/const/socket"
import { ConsumerOptions, TransportOptions } from "mediasoup-client/lib/types"
import { useSocket } from "@/provider/socket-provider"

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>()
  const { channelId } = params

  const { toast } = useToast()
  const { socket } = useSocket()

  const [onAir, setOnAir] = useState<boolean>(false)
  const [streaming, setStreaming] = useState<Streaming | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rtpCapabilities = useRef<mediasoup.types.RtpCapabilities | null>(null)
  const device = useRef<mediasoup.types.Device | null>(null)
  const recvTransport = useRef<mediasoup.types.Transport | null>(null)

  const _createDevice = async () => {
    device.current = new mediasoup.Device()
    await device.current.load({
      routerRtpCapabilities: rtpCapabilities.current!,
    })
    _createRecvTransport()
  }

  const _getProducer = () => {
    socket?.emit(
      SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER,
      channelId,
      (producerIds: string[]) => {
        console.log("Producer counts:", producerIds.length)
        for (const producerId of producerIds) {
          _createConsumer(producerId)
        }
      },
    )
  }

  const _createRecvTransport = () => {
    socket?.emit(
      SOCKET_EVENTS.MEDIASOUP_CREATE_TRANSPORT,
      {
        channelId,
        isSender: false,
      },
      (
        _transportOptions: Pick<
          TransportOptions,
          "id" | "iceParameters" | "iceCandidates" | "dtlsParameters"
        >,
      ) => {
        console.log("Transport options: ", _transportOptions)

        recvTransport.current =
          device.current!.createRecvTransport(_transportOptions)

        recvTransport.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              socket?.emit(SOCKET_EVENTS.MEDIASOUP_CONNECT_TRANSPORT, {
                channelId,
                dtlsParameters,
                sender: false,
              })
              callback()
            } catch (err: any) {
              errback(err)
            }
          },
        )

        _getProducer()
      },
    )
  }

  const _createConsumer = async (producerId: string) => {
    socket?.emit(
      SOCKET_EVENTS.MEDIASOUP_CONSUMER,
      {
        channelId,
        producerId,
        rtpCapabilities: rtpCapabilities.current,
      },
      async (consumerOptions: ConsumerOptions) => {
        assert(device.current, "Device is not defined.")
        assert(recvTransport.current, "Recv Transport is not defined.")
        assert(videoRef.current, "Video element is not defined.")

        const consumer = await recvTransport.current.consume(consumerOptions)

        const { track } = consumer
        if (consumer.kind === "video") {
          videoRef.current.srcObject = new MediaStream([track])
          socket?.emit(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
            channelId,
            consumerId: consumer.id,
          })
        } else if (consumer.kind === "audio") {
          // TODO: add audio element
        }
      },
    )
  }

  useEffect(() => {
    if (!socket) return

    socket.emit(
      SOCKET_EVENTS.STREAMING_JOIN,
      channelId,
      async (streaming: Streaming) => {
        setStreaming(streaming)
        setOnAir(true)
        rtpCapabilities.current =
          streaming.rtpCapabilities as mediasoup.types.RtpCapabilities
        console.log("RTP Capabilities: ", rtpCapabilities.current)

        await _createDevice()
      },
    )
  }, [socket])

  useEffect(() => {
    if (!socket || !onAir) return

    let destroyed = false

    socket.on(SOCKET_EVENTS.STREAMING_DESTROY, () => {
      setOnAir(false)
      destroyed = true
      toast({
        title: "The streamer closed the channel.",
        variant: "destructive",
      })
    })

    return () => {
      console.log(onAir, destroyed)
      if (onAir && !destroyed) {
        console.log(socket.connected)
        socket.emit(SOCKET_EVENTS.STREAMING_LEAVE, channelId)
      }
      socket.off("streamings:destroy")
    }
  }, [onAir, socket, channelId])

  return (
    <>
      {onAir ? (
        <>
          <div className='flex-grow flex flex-col bg-black'>
            <video className='h-full mx-auto' ref={videoRef} autoPlay />
            {streaming && <StreamingInfo streaming={streaming} />}
          </div>
          <Chat channelId={channelId} />
        </>
      ) : (
        <div className='flex-1 flex flex-col justify-center items-center'>
          <SignalSlashIcon className='w-20 h-20' />
          <h1 className='text-lg text-gray-500'>Channel is offline.</h1>
        </div>
      )}
    </>
  )
}

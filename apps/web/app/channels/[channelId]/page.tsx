"use client"

import { useLayoutEffect, useState, useRef } from "react"

import Chat from "@/components/channels/chat"
import { useToast } from "@/components/ui/use-toast"
import { SignalSlashIcon } from "@heroicons/react/24/solid"
import { useParams } from "next/navigation"
import * as mediasoup from "mediasoup-client"
import { Streaming } from "@kwitch/types"
import { StreamingInfo } from "@/components/channels/streaming-info"
import { SOCKET_EVENTS } from "@/const/socket"
import { useSocket } from "@/provider/socket-provider"
import { createConsumer, createDevice, createTransport } from "@/lib/mediasoup"

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>()
  const { channelId } = params

  const { toast } = useToast()
  const { socket } = useSocket()

  const [onAir, setOnAir] = useState<boolean>(false)
  const [streaming, setStreaming] = useState<Streaming | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const getProducer = async () => {
    return new Promise<string[]>((resolve) => {
      socket!.emit(SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER, channelId, resolve)
    })
  }

  useLayoutEffect(() => {
    if (!socket) return

    let recvTransport: mediasoup.types.Transport | null = null

    socket.emit(
      SOCKET_EVENTS.STREAMING_JOIN,
      channelId,
      async (streaming: Streaming) => {
        setStreaming(streaming)
        setOnAir(true)

        const rtpCapabilities =
          streaming.rtpCapabilities as mediasoup.types.RtpCapabilities
        console.log("RTP Capabilities: ", rtpCapabilities)
        const device = await createDevice(rtpCapabilities)
        recvTransport = await createTransport({
          socket,
          channelId,
          device,
          isSender: false,
        })
        const producerIds = await getProducer()
        const stream = new MediaStream()
        await Promise.all(
          producerIds.map(async (producerId) => {
            const consumer = await createConsumer({
              socket,
              channelId,
              producerId,
              transport: recvTransport!,
              rtpCapabilities,
            })
            stream.addTrack(consumer.track)
            socket.emit(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
              channelId,
              consumerId: consumer.id,
            })
          }),
        )
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch((error) => {
            console.error("Error playing video:", error)
          })
        }
      },
    )

    return () => {
      if (recvTransport) {
        recvTransport.close()
      }
    }
  }, [socket, channelId])

  useLayoutEffect(() => {
    if (!socket || !onAir) return

    socket.on(SOCKET_EVENTS.STREAMING_END, () => {
      setOnAir(false)
      toast({
        title: "The streamer closed the channel.",
        variant: "destructive",
      })
    })

    return () => {
      socket.off("streamings:destroy")
    }
  }, [onAir, socket, channelId])

  return (
    <>
      {onAir ? (
        <>
          <div className='flex-grow flex flex-col bg-black'>
            <video className='h-full mx-auto' ref={videoRef} autoPlay muted />
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

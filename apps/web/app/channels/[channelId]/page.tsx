"use client"

import { useEffect, useState, useRef } from "react"

import Chat from "@/components/channels/chat"
import { useToast } from "@/components/ui/use-toast"
import { SignalSlashIcon } from "@heroicons/react/24/solid"
import { useSocket } from "@/components/socket-provider"
import { useParams } from "next/navigation"
import * as mediasoup from "mediasoup-client"
import assert from "assert"
import { CustomResponse, Streaming } from "@kwitch/domain"
import { StreamingInfo } from "@/components/channels/streaming-info"

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>()
  const { channelId } = params

  const { socket, emitAsync } = useSocket()
  const { toast } = useToast()

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
    await _createRecvTransport()
    await _getProducer()
  }

  const _getProducer = async () => {
    const { producerIds } = await emitAsync("sfu:get-producers", { channelId })
    console.log("Producer Ids: ", producerIds)
    for (const producerId of producerIds) {
      await _createConsumer(producerId)
    }
  }

  const _createRecvTransport = async () => {
    const transportOptions = (await emitAsync("sfu:create-transport", {
      channelId,
      isSender: false,
    })) as mediasoup.types.TransportOptions
    console.log("Transport Options: ", transportOptions)

    recvTransport.current =
      device.current!.createRecvTransport(transportOptions)

    recvTransport.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          socket.emit("sfu:recv-transport-connect", {
            channelId,
            dtlsParameters,
          })
          callback()
        } catch (err: any) {
          errback(err)
        }
      },
    )
  }

  const _createConsumer = async (producerId: string) => {
    assert(device.current, "Device is not defined.")
    assert(recvTransport.current, "Recv Transport is not defined.")
    const consumerOptions = (await emitAsync("sfu:transport-consume", {
      channelId,
      producerId,
      rtpCapabilities: device.current.rtpCapabilities,
    })) as mediasoup.types.ConsumerOptions
    const consumer = await recvTransport.current.consume(consumerOptions)
    console.log("Consumer Id: ", consumer.id)

    assert(videoRef.current, "Video element is not defined.")
    const { track } = consumer
    if (consumer.kind === "video") {
      videoRef.current.srcObject = new MediaStream([track])
      socket.emit("sfu:consumer-resume", {
        channelId,
        consumerId: consumer.id,
      })
    } else if (consumer.kind === "audio") {
      // TODO: add audio element
    }
  }

  useEffect(() => {
    socket.emit("streamings:join", channelId, async (res: CustomResponse) => {
      try {
        if (res.success === false) {
          return
        }
        setOnAir(true)
        rtpCapabilities.current = res.content.rtpCapabilities
        console.log("RTP Capabilities: ", rtpCapabilities.current)
        await _createDevice()
        console.log(res.content.streaming)
        setStreaming(res.content.streaming)
      } catch (err: any) {
        console.error("Error joining the channel: ", err)
        toast({
          title: "Failed to join the channel. Refresh the page.",
          description: err.message,
          variant: "destructive",
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!onAir) return

    socket.on("streamings:destroy", () => {
      toast({
        title: "The streamer closed the channel.",
        variant: "destructive",
      })
      setOnAir(false)
      return
    })

    return () => {
      socket.emit("streamings:leave", channelId)
      socket.off("streamings:destroy")
    }
  }, [onAir])

  return (
    <>
      {onAir ? (
        <>
          <div className='flex-grow flex flex-col bg-black'>
              <video
                className='h-full mx-auto'
                ref={videoRef}
                autoPlay
              />
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

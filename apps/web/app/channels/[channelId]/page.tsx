"use client"

import { useLayoutEffect, useState, useRef } from "react"

import { useToast } from "@kwitch/ui/hooks/use-toast"
import {
  ArrowsPointingOutIcon,
  PlayIcon,
  SignalSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/solid"
import { useParams } from "next/navigation"
import * as mediasoup from "mediasoup-client"
import { Streaming } from "@kwitch/types"
import { StreamingInfo } from "@/components/channels/streaming-info"
import { SOCKET_EVENTS } from "@/const/socket"
import { useSocket } from "@/provider/socket-provider"
import { createConsumer, createDevice, createTransport } from "@/lib/mediasoup"
import { ChatComponent } from "@/components/channels/chat"
import { useAuth } from "@/provider/auth-provider"
import { Slider } from "@kwitch/ui/components/slider"

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>()
  const { channelId } = params ?? { channelId: "" }

  const { toast } = useToast()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [onAir, setOnAir] = useState<boolean>(false)
  const [streaming, setStreaming] = useState<Streaming | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [volume, setVolume] = useState<number>(100)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoControllerRef = useRef<HTMLDivElement | null>(null)

  const getProducer = async () => {
    return new Promise<string[]>((resolve) => {
      socket!.emit(SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER, channelId, resolve)
    })
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setVolume(newVolume)
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen().catch((error) => {
        console.error("Error requesting fullscreen:", error)
      })
    }
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
      socket.off(SOCKET_EVENTS.STREAMING_END)
    }
  }, [onAir, socket, channelId])

  return onAir ? (
    <>
      <div className='w-full flex flex-col overflow-y-auto scrollbar-hidden'>
        <div
          className='relative'
          onMouseEnter={() =>
            videoControllerRef.current?.classList.remove("opacity-0")
          }
          onMouseLeave={() =>
            videoControllerRef.current?.classList.add("opacity-0")
          }
        >
          <video
            className='w-full mx-auto aspect-video'
            ref={videoRef}
            autoPlay
            muted={isMuted}
          />
          <div
            ref={videoControllerRef}
            className='absolute opacity-0 transition-opacity duration-300 bottom-0 left-0 right-0 p-2 flex items-center gap-x-3'
          >
            <button onClick={handlePlayPause}>
              {isPlaying ? (
                <StopIcon className='size-4' />
              ) : (
                <PlayIcon className='size-4' />
              )}
            </button>
            <button onClick={handleMuteUnmute}>
              {isMuted ? (
                <SpeakerWaveIcon className='size-4' />
              ) : (
                <SpeakerXMarkIcon className='size-4' />
              )}
            </button>
            <Slider
              defaultValue={[volume]}
              max={100}
              step={1}
              className='w-24'
              onChange={handleVolumeChange}
            />
            <div className='flex-1'></div>
            <button onClick={handleFullscreen}>
              <ArrowsPointingOutIcon className='size-4' />
            </button>
          </div>
        </div>
        {streaming && <StreamingInfo streaming={streaming} />}
      </div>
      <div className='hidden xl:block'>
        <ChatComponent user={user} socket={socket} channelId={channelId} />
      </div>
    </>
  ) : (
    <div className='h-full w-full flex flex-col justify-center items-center'>
      <SignalSlashIcon className='w-20 h-20' />
      <h1 className='text-lg text-gray-500'>Channel is offline.</h1>
    </div>
  )
}

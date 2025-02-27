"use client"

import { useLayoutEffect, useState, useRef, useEffect } from "react"

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

  const combineVideoRef = useRef<HTMLVideoElement | null>(null)
  const displayVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoControllerRef = useRef<HTMLDivElement | null>(null)

  const recvTransportRef = useRef<mediasoup.types.Transport | null>(null)
  const consumersRef = useRef<mediasoup.types.Consumer[]>([])

  const getProducers = () => {
    if (!socket) return []

    return new Promise<mediasoup.types.Producer[]>((resolve) => {
      socket.emit(SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER, channelId, resolve)
    })
  }

  const handlePlayPause = () => {
    if (displayVideoRef.current && userVideoRef.current) {
      if (isPlaying) {
        displayVideoRef.current.pause()
        userVideoRef.current.pause()
      } else {
        displayVideoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
        })
        userVideoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteUnmute = () => {
    if (displayVideoRef.current && userVideoRef.current) {
      displayVideoRef.current.muted = !isMuted
      userVideoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = ([value]: number[]) => {
    if (!value) return
    setIsMuted(false)

    const newVolume = value / 100
    if (displayVideoRef.current && userVideoRef.current && value) {
      displayVideoRef.current.volume = newVolume
      userVideoRef.current.volume = newVolume
    }
  }

  const handleFullscreen = () => {
    if (combineVideoRef.current) {
      combineVideoRef.current.requestFullscreen().catch((error) => {
        console.error("Error requesting fullscreen:", error)
      })
    }
  }

  const drawCanvas = () => {
    if (
      !combineVideoRef.current ||
      !displayVideoRef.current ||
      !userVideoRef.current
    ) {
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const displayVideo = displayVideoRef.current
    const userVideo = userVideoRef.current

    canvas.width = displayVideo.videoWidth
    canvas.height = displayVideo.videoHeight
    ctx.imageSmoothingEnabled = false

    combineVideoRef.current.srcObject = canvas.captureStream(30)
    combineVideoRef.current.play().catch((error) => {
      console.error("Error playing video:", error)
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        userVideo,
        canvas.width - userVideo.videoWidth,
        canvas.height - userVideo.videoHeight,
        userVideo.videoWidth,
        userVideo.videoHeight,
      )

      requestAnimationFrame(draw)
    }

    draw()
  }

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
      if (recvTransportRef.current) {
        recvTransportRef.current.close()
      }

      if (consumersRef.current.length) {
        for (const consumer of consumersRef.current) {
          consumer.close()
        }
      }

      socket.off(SOCKET_EVENTS.STREAMING_END)
    }
  }, [onAir, socket, channelId])

  useEffect(() => {
    if (!socket || !channelId) return

    socket.emit(
      SOCKET_EVENTS.STREAMING_JOIN,
      channelId,
      async (streaming: Streaming) => {
        setStreaming(streaming)
        setOnAir(true)

        const rtpCapabilities =
          streaming.rtpCapabilities as mediasoup.types.RtpCapabilities
        const device = await createDevice(rtpCapabilities)
        const recvTransport = await createTransport({
          socket,
          channelId,
          device,
          isSender: false,
        })

        const producers = await getProducers()

        const displayVideo = displayVideoRef.current!
        const userVideo = userVideoRef.current!

        displayVideo.onloadedmetadata = () => {
          if (userVideo.readyState >= 1) {
            drawCanvas()
          }
        }

        userVideo.onloadedmetadata = () => {
          if (displayVideo.readyState >= 1) {
            drawCanvas()
          }
        }

        const displayStream = new MediaStream()
        const userStream = new MediaStream()

        for (const producer of producers) {
          const consumer = await createConsumer({
            socket,
            channelId,
            producerId: producer.id,
            transport: recvTransport,
            rtpCapabilities,
          })

          if (producer.appData.source === "display") {
            displayStream.addTrack(consumer.track)
          } else if (producer.appData.source === "user") {
            userStream.addTrack(consumer.track)
          } else {
            console.error("Unknown producer source:", producer.appData.source)
          }

          socket.emit(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
            channelId,
            consumerId: consumer.id,
          })
        }

        displayVideo.srcObject = displayStream
        displayVideo.play().catch((error) => {
          console.error("Error playing display video:", error)
        })

        userVideo.srcObject = userStream
        userVideo.play().catch((error) => {
          console.error("Error playing user video:", error)
        })

        recvTransportRef.current = recvTransport
      },
    )
  }, [socket, channelId])

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
            ref={combineVideoRef}
            autoPlay
            playsInline
            muted={isMuted}
          />
          <video
            className='hidden'
            ref={displayVideoRef}
            autoPlay
            playsInline
            muted={isMuted}
          />
          <video
            className='hidden'
            ref={userVideoRef}
            autoPlay
            playsInline
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
                <SpeakerXMarkIcon className='size-4' />
              ) : (
                <SpeakerWaveIcon className='size-4' />
              )}
            </button>
            <Slider
              defaultValue={[100]}
              max={100}
              step={1}
              className='w-24'
              onValueChange={handleVolumeChange}
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

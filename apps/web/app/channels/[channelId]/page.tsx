"use client"

import {
  useLayoutEffect,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react"

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
import { StreamingInfo } from "@/components/streaming/StreamingInfo"
import { SOCKET_EVENTS } from "@/lib/const/socket"
import { useSocket } from "@/components/provider/socket-provider"
import { createConsumer, createDevice, createTransport } from "@/lib/mediasoup"
import { ChatComponent } from "@/components/channels/Chat"
import { useAuth } from "@/components/provider/AuthProvider"
import { Slider } from "@kwitch/ui/components/slider"
import { Socket } from "socket.io-client"

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const combineVideoRef = useRef<HTMLVideoElement | null>(null)
  const displayVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const videoControllerRef = useRef<HTMLDivElement | null>(null)

  const recvTransportRef = useRef<mediasoup.types.Transport | null>(null)
  const consumersRef = useRef<mediasoup.types.Consumer[]>([])

  const getProducers = ({ socket }: { socket: Socket }) => {
    return new Promise<mediasoup.types.Producer[]>((resolve) => {
      socket.emit(SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER, channelId, resolve)
    })
  }

  const init = async ({
    socket,
    channelId,
    streaming,
  }: {
    socket: Socket
    channelId: string
    streaming: Streaming
  }) => {
    console.debug("init()")

    if (
      !combineVideoRef.current ||
      !displayVideoRef.current ||
      !userVideoRef.current
    ) {
      console.error("init() ref.current is null")
      return
    }

    const rtpCapabilities =
      streaming.rtpCapabilities as mediasoup.types.RtpCapabilities
    const device = await createDevice(rtpCapabilities)
    const recvTransport = await createTransport({
      socket,
      channelId,
      device,
      isSender: false,
    })

    const producers = await getProducers({ socket })
    console.debug("init() recognized producers count: ", producers.length)

    const displayStream = new MediaStream()
    const userVideoStream = new MediaStream()

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
        userVideoStream.addTrack(consumer.track)
      } else {
        console.error("Unknown producer source:", producer.appData.source)
      }

      consumersRef.current.push(consumer)

      socket.emit(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
        channelId,
        consumerId: consumer.id,
      })
    }

    displayVideoRef.current.srcObject = displayStream
    displayVideoRef.current.play()
    userVideoRef.current.srcObject = userVideoStream
    userVideoRef.current.play()

    recvTransportRef.current = recvTransport

    drawCanvas({ streaming })
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

  const drawCanvas = ({ streaming }: { streaming: Streaming }) => {
    if (
      !canvasRef.current ||
      !combineVideoRef.current ||
      !displayVideoRef.current ||
      !userVideoRef.current ||
      !consumersRef.current
    ) {
      console.error("drawCanvas() ref.current is null")
      return
    }

    console.debug("drawCanvas()")

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const combineVideo = combineVideoRef.current
    const displayVideo = displayVideoRef.current
    const userVideo = userVideoRef.current

    let animationFrameId: number | null = null

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    canvas.width = 1920
    canvas.height = 1080

    combineVideo.srcObject = canvas.captureStream(30)
    combineVideo.play().catch((error) => {
      console.error("Error playing video:", error)
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (streaming.layout) {
        case "both":
          ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height)
          ctx.drawImage(
            userVideo,
            canvas.width - userVideo.videoWidth,
            canvas.height - userVideo.videoHeight,
            userVideo.videoWidth,
            userVideo.videoHeight,
          )
          break
        case "display":
          ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height)
          break
        case "camera":
          ctx.drawImage(userVideo, 0, 0, canvas.width, canvas.height)
          break
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    console.log("drawCanvas() drawing started")
    requestAnimationFrame(draw)
  }

  useEffect(() => {
    if (!socket || !channelId) return

    let ended = false

    socket.emit(
      SOCKET_EVENTS.STREAMING_JOIN,
      channelId,
      (streaming: Streaming) => {
        setOnAir(true)
        setStreaming(streaming)

        setTimeout(() => {
          init({ socket, channelId, streaming })
        }, 1000)
      },
    )

    socket.on(SOCKET_EVENTS.STREAMING_UPDATE, (streaming: Streaming) => {
      drawCanvas({ streaming })
      setStreaming(streaming)
    })

    socket.on(SOCKET_EVENTS.STREAMING_END, () => {
      ended = true
      setOnAir(false)
      toast({
        title: "The streamer closed the channel.",
        variant: "destructive",
      })
    })

    return () => {
      setOnAir(false)
      setStreaming(null)

      consumersRef.current.forEach((consumer) => {
        consumer.close()
      })
      recvTransportRef.current?.close()

      ended && socket.emit(SOCKET_EVENTS.STREAMING_LEAVE, channelId)
      socket.off(SOCKET_EVENTS.STREAMING_UPDATE)
      socket.off(SOCKET_EVENTS.STREAMING_END)
    }
  }, [socket, channelId])

  return onAir && streaming ? (
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
          <video ref={combineVideoRef} autoPlay playsInline muted={isMuted}>
            <canvas
              className='w-[1px] h-[1px] opacity-0'
              ref={canvasRef}
            ></canvas>
          </video>
          <video className='hidden' ref={displayVideoRef} muted={isMuted} />
          <video className='hidden' ref={userVideoRef} muted={isMuted} />
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

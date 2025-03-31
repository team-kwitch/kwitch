"use client"

import { useState, useRef, use, useEffect } from "react"

import { useToast } from "@kwitch/ui/hooks/use-toast"
import { Streaming } from "@kwitch/types"
import { StreamingInfo } from "@/components/streaming/StreamingInfo"
import { useAuth } from "@/components/provider/AuthProvider"
import { useStreamingClient } from "@/hooks/useStreamingClient"
import mediasoup from "mediasoup-client"
import { request } from "http"
import { ChatComponent } from "@/components/channels/Chat"
import { socket } from "@/lib/socket"
import {
  StopIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  ArrowsPointingOutIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/solid"
import { Slider } from "@kwitch/ui/components/slider"
import { PlayIcon } from "lucide-react"
import { title } from "process"

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const { channelId } = use(params)

  const { toast } = useToast()
  const { user } = useAuth()

  const {
    title,
    layout,
    isSocketConnected,
    isStreamingOnLive,
    userCameraTrack,
    userMicTrack,
    displayVideoTrack,
    displayAudioTrack,
    joinStreaming,
  } = useStreamingClient()

  const [streaming, setStreaming] = useState<Streaming | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isMuted, setIsMuted] = useState<boolean>(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const combineVideoRef = useRef<HTMLVideoElement | null>(null)
  const displayRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)
  const videoControllerRef = useRef<HTMLDivElement | null>(null)
  const animationFrameIdRef = useRef<number>(-1)

  const handlePlayPause = () => {
    if (isPlaying) {
      displayRef.current!.pause()
      userVideoRef.current!.pause()
      userAudioRef.current!.pause()
    } else {
      displayRef.current!.play()
      userVideoRef.current!.play()
      userAudioRef.current!.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleMuteUnmute = () => {
    displayRef.current!.muted = !isMuted
    userVideoRef.current!.muted = !isMuted
    userAudioRef.current!.muted = !isMuted
    userAudioRef.current!.play()
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = ([value]: number[]) => {
    if (!value) return
    setIsMuted(false)

    const newVolume = value / 100
    displayRef.current!.volume = newVolume
    userAudioRef.current!.volume = newVolume
  }

  const handleFullscreen = () => {
    if (combineVideoRef.current) {
      combineVideoRef.current.requestFullscreen().catch((error) => {
        console.error("Error requesting fullscreen:", error)
      })
    }
  }

  const drawCanvas = ({ streaming }: { streaming: Streaming }) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const combineVideo = combineVideoRef.current!
    const displayVideo = displayRef.current!
    const userVideo = userVideoRef.current!

    if (animationFrameIdRef.current !== -1) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }

    canvas.width =
      streaming.layout === "camera"
        ? userVideo.videoWidth
        : Math.max(1920, displayVideo.videoWidth, userVideo.videoWidth)
    canvas.height =
      streaming.layout === "camera"
        ? userVideo.videoHeight
        : Math.max(1080, displayVideo.videoHeight, userVideo.videoHeight)

    console.log("drawCanvas() drawing started")

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (streaming.layout) {
        case "both":
          ctx.drawImage(
            displayVideo,
            0,
            0,
            displayVideo.videoWidth,
            displayVideo.videoHeight,
          )
          ctx.drawImage(
            userVideo,
            canvas.width - userVideo.videoWidth,
            canvas.height - userVideo.videoHeight,
            userVideo.videoWidth,
            userVideo.videoHeight,
          )
          break
        case "display":
          ctx.drawImage(
            displayVideo,
            0,
            0,
            displayVideo.videoWidth,
            displayVideo.videoHeight,
          )
          break
        case "camera":
          ctx.drawImage(
            userVideo,
            0,
            0,
            userVideo.videoWidth,
            userVideo.videoHeight,
          )
          break
      }

      animationFrameIdRef.current = requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)

    combineVideo.srcObject = canvas.captureStream(30)
  }

  useEffect(() => {
    if (channelId && isSocketConnected) {
      joinStreaming({ channelId })
        .then((streaming) => {
          setStreaming(streaming)
        })
        .catch((error) => {
          toast({
            title: "Error joining streaming",
            description: error.message,
            variant: "destructive",
          })
        })
    }
  }, [channelId, isSocketConnected])

  useEffect(() => {
    if (!streaming) return

    if (!userVideoRef.current || !userAudioRef.current || !displayRef.current)
      return

    if (userCameraTrack) {
      userVideoRef.current.srcObject = new MediaStream([userCameraTrack])
      userVideoRef.current.onloadedmetadata = () => {
        userVideoRef.current!.play()
        drawCanvas({ streaming })
      }
    }

    if (userMicTrack) {
      userAudioRef.current.srcObject = new MediaStream([userMicTrack])
      if (!isMuted) {
        userAudioRef.current!.play()
      }
    }

    if (displayVideoTrack) {
      const mediaStream = new MediaStream()
      if (displayVideoTrack) {
        mediaStream.addTrack(displayVideoTrack)
      }
      if (displayAudioTrack) {
        mediaStream.addTrack(displayAudioTrack)
      }
      displayRef.current.srcObject = mediaStream
      displayRef.current.onloadedmetadata = () => {
        displayRef.current!.play()
        drawCanvas({ streaming })
      }
    }
  }, [
    streaming,
    userCameraTrack,
    userMicTrack,
    displayVideoTrack,
    displayAudioTrack,
  ])

  useEffect(() => {
    if (!streaming) return

    if (streaming.layout !== layout) {
      setStreaming((prev) => {
        if (!prev) return null
        return {
          ...prev,
          layout: layout,
        }
      })

      drawCanvas({ streaming })
    }

    if (streaming.title !== title) {
      setStreaming((prev) => {
        if (!prev) return null
        return {
          ...prev,
          title: title,
        }
      })
    }
  }, [title, layout])

  return isStreamingOnLive && streaming ? (
    <div className='w-full h-full flex gap-x-4 px-4 xxl:container'>
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
            className='w-full'
            ref={combineVideoRef}
            autoPlay
            playsInline
            muted
          >
            <canvas className='opacity-0' ref={canvasRef}></canvas>
          </video>
          <video className='hidden' ref={displayRef} muted={isMuted} />
          <video className='hidden' ref={userVideoRef} muted />
          <audio ref={userAudioRef} muted={isMuted} />
          <div
            ref={videoControllerRef}
            className='absolute opacity-0 transition-opacity duration-300 bottom-0 left-0 right-0 p-2 flex items-center gap-x-3'
          >
            <button onClick={() => handlePlayPause()}>
              {isPlaying ? (
                <StopIcon className='size-4' />
              ) : (
                <PlayIcon className='size-4' />
              )}
            </button>
            <button onClick={() => handleMuteUnmute()}>
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
              onValueChange={(value) => handleVolumeChange(value)}
            />
            <div className='flex-1'></div>
            <button onClick={() => handleFullscreen()}>
              <ArrowsPointingOutIcon className='size-4' />
            </button>
          </div>
        </div>
        <StreamingInfo streaming={streaming} />
      </div>
      <div className='hidden xl:block'>
        <ChatComponent user={user} socket={socket} channelId={channelId} />
      </div>
    </div>
  ) : (
    <div className='h-full w-full flex flex-col justify-center items-center'>
      <SignalSlashIcon className='w-20 h-20' />
      <h1 className='text-lg text-gray-500'>Channel is offline.</h1>
    </div>
  )
}

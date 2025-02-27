"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { Button } from "@kwitch/ui/components/button"
import { Input } from "@kwitch/ui/components/input"
import { Label } from "@kwitch/ui/components/label"
import { SignalIcon } from "@heroicons/react/20/solid"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import * as mediasoup from "mediasoup-client"
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters"
import { SOCKET_EVENTS } from "@/const/socket"
import { useAuth } from "@/provider/auth-provider"
import { useSocket } from "@/provider/socket-provider"
import { createDevice, createTransport, createProducer } from "@/lib/mediasoup"
import { ChatComponent } from "@/components/channels/chat"
import {
  ComputerDesktopIcon,
  MicrophoneIcon,
  SignalSlashIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid"
import { StreamingLayout } from "@kwitch/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kwitch/ui/components/select"

const createEmptyVideoTrack = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const stream = canvas.captureStream()

  const videoElement = document.createElement("video")
  videoElement.hidden = true
  videoElement.srcObject = stream
  videoElement.play()

  return stream.getVideoTracks()[0]!
}

const createEmptyAudioTrack = () => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const dest = audioContext.createMediaStreamDestination()

  oscillator.connect(dest)
  oscillator.start()

  return dest.stream.getAudioTracks()[0]!
}

export default function StreamManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [layout, setLayout] = useState<StreamingLayout>("both")
  const displayVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)

  const sendTransportRef = useRef<mediasoup.types.Transport | null>(null)
  const producersRef = useRef<{
    user: {
      video: mediasoup.types.Producer | null
      audio: mediasoup.types.Producer | null
    }
    display: {
      video: mediasoup.types.Producer | null
      audio: mediasoup.types.Producer | null
    }
  }>({
    user: {
      video: null,
      audio: null,
    },
    display: {
      video: null,
      audio: null,
    },
  })
  const tracksRef = useRef<{
    user: {
      video: MediaStreamTrack
      audio: MediaStreamTrack
    }
    display: {
      video: MediaStreamTrack
      audio: MediaStreamTrack
    }
  }>({
    user: {
      video: createEmptyVideoTrack(),
      audio: createEmptyAudioTrack(),
    },
    display: {
      video: createEmptyVideoTrack(),
      audio: createEmptyAudioTrack(),
    },
  })

  const [title, setTitle] = useState("")
  const [onAir, setOnAir] = useState(false)

  const [isScreenPaused, setIsScreenPaused] = useState(true)
  const [isMicPaused, setIsMicPaused] = useState(true)
  const [isCameraPaused, setIsCameraPaused] = useState(true)

  const startStreaming = (title: string) => {
    if (!user || !socket) return

    socket.emit(
      SOCKET_EVENTS.STREAMING_START,
      { title, layout },
      async (_rtpCapabilities: RtpCapabilities) => {
        const device = await createDevice(_rtpCapabilities)
        const sendTransport = await createTransport({
          socket,
          channelId: user.channel.id,
          device,
          isSender: true,
        })

        Object.entries(tracksRef.current).forEach(([key, track]) => {
          Object.values(track).forEach((track) => {
            if (track) {
              createProducerAndSetUp({
                track,
                transport: sendTransport,
                source: key as "display" | "user",
              })
            }
          })
        })

        sendTransportRef.current = sendTransport

        setOnAir(true)
      },
    )
  }

  const createProducerAndSetUp = async ({
    track,
    transport: sendTransport,
    source,
  }: {
    track: MediaStreamTrack
    transport: mediasoup.types.Transport
    source: "display" | "user"
  }) => {
    const producer = await createProducer({
      transport: sendTransport,
      producerOptions: {
        track,
        appData: {
          source,
        },
      },
    })

    const index = `${track.kind}-${source}`
    switch (index) {
      case "video-display":
        producersRef.current.display.video = producer
        break
      case "audio-display":
        producersRef.current.display.audio = producer
        break
      case "video-user":
        producersRef.current.user.video = producer
        break
      case "audio-user":
        producersRef.current.user.audio = producer
        break
    }
  }

  const enableDisplay = async () => {
    if (!displayVideoRef.current) {
      return
    }

    console.debug("enableDisplay()")

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      })

      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      if (videoTrack) {
        tracksRef.current.display.video = videoTrack
        producersRef.current.display.video?.replaceTrack({
          track: videoTrack,
        })
      }

      if (audioTrack) {
        producersRef.current.display.audio?.replaceTrack({
          track: audioTrack,
        })
      }

      displayVideoRef.current.srcObject = stream

      setIsScreenPaused(false)
    } catch (err: any) {
      console.error(err)
    }
  }

  const disableDisplay = () => {
    if (!displayVideoRef.current) {
      return
    }

    console.debug("disableDisplay()")

    const emptyVideoTrack = createEmptyVideoTrack()
    const emptyAudioTrack = createEmptyAudioTrack()
    const emptyMediaStream = new MediaStream([emptyVideoTrack, emptyAudioTrack])

    const stream = displayVideoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => {
      track.stop()
    })
    displayVideoRef.current.srcObject = emptyMediaStream

    producersRef.current.display.video?.replaceTrack({
      track: emptyVideoTrack,
    })
    producersRef.current.display.audio?.replaceTrack({
      track: emptyAudioTrack,
    })

    setIsScreenPaused(true)
  }

  const enableMic = async () => {
    if (!userAudioRef.current) {
      return
    }

    console.debug("enableMic()")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const audioTrack = stream.getAudioTracks()[0]

      if (audioTrack) {
        tracksRef.current.user.audio = audioTrack
        producersRef.current.user.audio?.replaceTrack({
          track: audioTrack,
        })
      }

      userAudioRef.current.srcObject = stream

      setIsMicPaused(false)
    } catch (err: any) {
      console.error(err)
    }
  }

  const disableMic = () => {
    if (!userAudioRef.current) {
      return
    }

    console.debug("disableMic()")

    const emptyAudioTrack = createEmptyAudioTrack()
    const emptyAudioMediaStream = new MediaStream([emptyAudioTrack])

    const stream = userAudioRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => {
      track.stop()
    })
    userAudioRef.current.srcObject = emptyAudioMediaStream

    producersRef.current.user.audio?.replaceTrack({
      track: emptyAudioTrack,
    })

    setIsMicPaused(true)
  }

  const enableCamera = async () => {
    if (!userVideoRef.current) {
      return
    }

    console.debug("enableCamera()")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      const videoTrack = stream.getVideoTracks()[0]

      if (videoTrack) {
        tracksRef.current.user.video = videoTrack
        producersRef.current.user.video?.replaceTrack({
          track: videoTrack,
        })
      }

      userVideoRef.current.srcObject = stream

      setIsCameraPaused(false)
    } catch (err: any) {
      console.error(err)
    }
  }

  const disableCamera = () => {
    if (!userVideoRef.current) {
      return
    }

    console.debug("disableCamera()")

    const emptyVideoTrack = createEmptyVideoTrack()
    const emptyVideoMediaStream = new MediaStream([emptyVideoTrack])

    producersRef.current.user.video?.replaceTrack({
      track: emptyVideoTrack,
    })

    const stream = userVideoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => {
      track.stop()
    })
    userVideoRef.current.srcObject = emptyVideoMediaStream

    setIsCameraPaused(true)
  }

  useLayoutEffect(() => {
    return () => {
      sendTransportRef.current?.close()

      Object.values(producersRef.current).forEach((source) => {
        Object.values(source).forEach((producer) => {
          producer?.close()
        })
      })

      if (displayVideoRef.current) {
        const stream = displayVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      if (userVideoRef.current) {
        const stream = userVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => {
          track.stop
        })
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (!onAir) return

      toast({
        title: "Streaming ended",
        description: "The streaming has ended successfully.",
        variant: "success",
      })
    }
  }, [onAir])

  if (!user) {
    return null
  }

  return (
    <div className='h-full flex gap-x-4 mx-4'>
      <div className='w-full max-w-7xl mx-auto overflow-y-auto scrollbar-hidden flex flex-col mt-8'>
        <div className='flex items-center gap-x-3 mb-5'>
          <span className='text-xl font-bold'>Preview</span>
          {onAir ? (
            <>
              <SignalIcon className='w-4 h-4 inline-block text-red-600'></SignalIcon>
              <span>On Air</span>
            </>
          ) : (
            <>
              <SignalSlashIcon className='size-4 inline-block'></SignalSlashIcon>
              <span>Off Air</span>
            </>
          )}
        </div>
        <div className='relative w-[60%] aspect-video bg-black border mb-6'>
          <video
            className={layout !== "camera" ? "streaming-layout-full" : "hidden"}
            autoPlay
            muted
            playsInline
            ref={displayVideoRef}
          />
          <video
            className={
              layout === "camera"
                ? "streaming-layout-full"
                : layout === "both"
                  ? "streaming-layout-box"
                  : "hidden"
            }
            autoPlay
            muted
            playsInline
            ref={userVideoRef}
          />
          <audio ref={userAudioRef} autoPlay muted playsInline />
        </div>
        <div className='flex items-center gap-x-3 mb-5'>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={onAir}
            className='w-64'
          />
          <div className='flex items-center gap-x-3'>
            <Button
              disabled={!title || onAir}
              onClick={(e) => startStreaming(title)}
              className='mr-3'
            >
              Start
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-x-4 mb-5'>
          <Button
            variant={isScreenPaused ? "outline" : "default"}
            onClick={isScreenPaused ? enableDisplay : disableDisplay}
          >
            <ComputerDesktopIcon className='size-5' />
          </Button>
          <Button
            variant={isMicPaused ? "outline" : "default"}
            onClick={isMicPaused ? enableMic : disableMic}
          >
            <MicrophoneIcon className='size-5' />
          </Button>
          <Button
            variant={isCameraPaused ? "outline" : "default"}
            onClick={isCameraPaused ? enableCamera : disableCamera}
          >
            <VideoCameraIcon className='size-5' />
          </Button>
        </div>
        <Select
          value={layout}
          onValueChange={(value) => setLayout(value as StreamingLayout)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='both'>Both</SelectItem>
            <SelectItem value='camera'>Camera</SelectItem>
            <SelectItem value='screen'>Screen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChatComponent user={user} socket={socket} channelId={user.channel.id} />
    </div>
  )
}

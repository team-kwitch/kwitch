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

type Producers = {
  audio: mediasoup.types.Producer | null
  video: mediasoup.types.Producer | null
}

export default function StreamManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [layout, setLayout] = useState<StreamingLayout>("both")
  const displayVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)

  const sendTransportRef = useRef<mediasoup.types.Transport | null>(null)
  const displayProducersRef = useRef<Producers>({ audio: null, video: null })
  const userProducersRef = useRef<Producers>({ audio: null, video: null })

  const [title, setTitle] = useState("")
  const [onAir, setOnAir] = useState(false)

  const startStreaming = (title: string) => {
    if (!user || !socket) return

    socket.emit(
      SOCKET_EVENTS.STREAMING_START,
      { title, layout },
      async (_rtpCapabilities: RtpCapabilities) => {
        console.log("RTPCapabilities: ", _rtpCapabilities)
        const device = await createDevice(_rtpCapabilities)
        const sendTransport = await createTransport({
          socket,
          channelId: user.channel.id,
          device,
          isSender: true,
        })

        if (displayVideoRef.current) {
          createProducerAndSetUp({
            video: displayVideoRef.current,
            transport: sendTransport,
            source: "display",
            producers: displayProducersRef.current,
          })
        }

        if (userVideoRef.current) {
          createProducerAndSetUp({
            video: userVideoRef.current,
            transport: sendTransport,
            source: "user",
            producers: userProducersRef.current,
          })
        }

        sendTransportRef.current = sendTransport

        setOnAir(true)
      },
    )
  }

  const createProducerAndSetUp = async ({
    video,
    transport: sendTransport,
    source,
    producers,
  }: {
    video: HTMLVideoElement
    transport: mediasoup.types.Transport
    source: "display" | "user"
    producers: Producers
  }) => {
    const mediaStream = video.srcObject as MediaStream

    for (const track of mediaStream.getVideoTracks()) {
      const producer = await createProducer({
        transport: sendTransport,
        producerOptions: {
          track,
          appData: {
            source,
          },
        },
      })
      producers.video = producer
    }

    for (const track of mediaStream.getAudioTracks()) {
      const producer = await createProducer({
        transport: sendTransport,
        producerOptions: {
          track,
          appData: {
            source,
          },
        },
      })
      producers.audio = producer
    }
  }

  const getDisplayStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      })

      if (displayVideoRef.current) {
        displayVideoRef.current.srcObject = stream
        _onStreamSuccess(displayProducersRef.current, stream)
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const getUserStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
        _onStreamSuccess(userProducersRef.current, stream)
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error enabling camera",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const _onStreamSuccess = async (
    producers: Producers,
    stream: MediaStream,
  ) => {
    const audioTrack = stream.getAudioTracks()[0]
    const videoTrack = stream.getVideoTracks()[0]

    if (audioTrack && producers.audio) {
      producers.audio.replaceTrack({ track: audioTrack })
    }
    if (videoTrack && producers.video) {
      producers.video.replaceTrack({ track: videoTrack })
    }
  }

  useLayoutEffect(() => {
    getUserStream()

    if (displayVideoRef.current) {
      displayVideoRef.current.srcObject = new MediaStream([
        createEmptyVideoTrack(),
        createEmptyVideoTrack(),
      ])
    }

    if (userVideoRef.current) {
      userVideoRef.current.srcObject = new MediaStream([
        createEmptyVideoTrack(),
        createEmptyAudioTrack(),
      ])
    }

    return () => {
      displayProducersRef.current.audio?.close()
      displayProducersRef.current.video?.close()
      userProducersRef.current.audio?.close()
      userProducersRef.current.video?.close()
      sendTransportRef.current?.close()

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
      <div className='rounded-xl container mx-auto w-full overflow-y-auto scrollbar-hidden flex flex-col'>
        <div className='flex items-center gap-x-3 mb-5'>
          <span className='text-xl font-bold'>Preview</span>
          {onAir && (
            <>
              <SignalIcon className='w-4 h-4 inline-block text-red-600'></SignalIcon>
              <span>On Air</span>
            </>
          )}
        </div>
        <div className='relative max-w-[60%] aspect-video bg-black border mb-6'>
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
          <Button onClick={getDisplayStream}>
            <ComputerDesktopIcon className='size-5' />
          </Button>
          <Button onClick={() => {}}>
            <MicrophoneIcon className='size-5' />
          </Button>
          <Button onClick={() => {}}>
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
      {onAir && (
        <ChatComponent
          user={user}
          socket={socket}
          channelId={user.channel.id}
        />
      )}
    </div>
  )
}

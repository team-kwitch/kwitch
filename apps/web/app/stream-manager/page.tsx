"use client"

import { useLayoutEffect, useRef, useState } from "react"

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
import { AlertTriangle } from "@kwitch/ui/components/alert-triangle"
import { ChatComponent } from "@/components/channels/chat"
import { ComputerDesktopIcon } from "@heroicons/react/24/solid"

const createEmptyVideoTrack = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const stream = canvas.captureStream()
  return stream.getVideoTracks()[0]
}

const createEmptyAudioTrack = () => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const dest = audioContext.createMediaStreamDestination()

  oscillator.connect(dest)
  oscillator.start()

  return dest.stream.getAudioTracks()[0]
}

export default function StreamManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { socket } = useSocket()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sendTransport = useRef<mediasoup.types.Transport | null>(null)
  const audioProducer = useRef<mediasoup.types.Producer | null>(null)
  const videoProducer = useRef<mediasoup.types.Producer | null>(null)

  const [title, setTitle] = useState("")
  const [onAir, setOnAir] = useState(false)

  const startStreaming = (title: string) => {
    if (!socket) return

    socket.emit(
      SOCKET_EVENTS.STREAMING_START,
      { title },
      async (_rtpCapabilities: RtpCapabilities) => {
        console.log("RTPCapabilities: ", _rtpCapabilities)
        const device = await createDevice(_rtpCapabilities)
        sendTransport.current = await createTransport({
          socket,
          channelId: user!.channel.id,
          device,
          isSender: true,
        })

        audioProducer.current = await createProducer({
          transport: sendTransport.current,
          producerOptions: {
            track: createEmptyAudioTrack(),
          },
        })

        videoProducer.current = await createProducer({
          transport: sendTransport.current,
          producerOptions: { track: createEmptyVideoTrack() },
        })

        setOnAir(true)
      },
    )
  }

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      })
      await _onStreamSuccess(stream)
    } catch (err: any) {
      console.error(err)
    }
  }

  const _onStreamSuccess = async (stream: MediaStream) => {
    videoRef.current!.srcObject = stream

    const audioTrack = stream.getAudioTracks()[0]
    const videoTrack = stream.getVideoTracks()[0]

    if (audioTrack && audioProducer.current) {
      audioProducer.current.replaceTrack({ track: audioTrack })
    }
    if (videoTrack && videoProducer.current) {
      videoProducer.current.replaceTrack({ track: videoTrack })
    }
  }

  useLayoutEffect(() => {
    return () => {
      if (!onAir) return

      setOnAir(false)
      toast({
        title: "Streaming ended",
        description: "The streaming has ended successfully.",
        variant: "success",
      })

      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach((track) => {
        track.stop()
      })
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
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
        <video
          className='max-w-[80%] aspect-video bg-black border mb-6'
          autoPlay
          playsInline
          muted
          ref={videoRef}
        />
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
        <div className='flex items-center'>
          {onAir && <Button onClick={getLocalStream}>Screen</Button>}
        </div>
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

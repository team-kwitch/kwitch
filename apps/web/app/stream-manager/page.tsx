"use client"

import { useLayoutEffect, useRef, useState } from "react"

import Chat from "@/components/channels/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { SignalIcon } from "@heroicons/react/20/solid"
import { useToast } from "@/components/ui/use-toast"
import * as mediasoup from "mediasoup-client"
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters"
import { SOCKET_EVENTS } from "@/const/socket"
import { useAuth } from "@/provider/auth-provider"
import { useSocket } from "@/provider/socket-provider"
import { createDevice, createTransport, createProducer } from "@/lib/mediasoup"

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
  const { user } = useAuth()
  const { socket } = useSocket()
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sendTransport = useRef<mediasoup.types.Transport | null>(null)
  const audioProducer = useRef<mediasoup.types.Producer | null>(null)
  const videoProducer = useRef<mediasoup.types.Producer | null>(null)

  const [title, setTitle] = useState("")
  const [warning, setWarning] = useState("")
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
    <div className='flex-1 flex'>
      <div className='container max-w-7xl py-8 overflow-y-auto scroll'>
        <h1 className='text-4xl font-bold mb-5'>Start Streaming</h1>
        <div className='flex items-center gap-x-4 mb-5'>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={onAir}
            className='w-64'
          />
        </div>
        <div className='flex items-center gap-x-3 mb-5'>
          <Button
            disabled={onAir}
            onClick={(e) => startStreaming(title)}
            className='mr-3'
          >
            Start
          </Button>
          {onAir && (
            <>
              <SignalIcon className='w-4 h-4 inline-block text-red-600'></SignalIcon>
              <span>On Air</span>
            </>
          )}
        </div>
        {!onAir && warning && (
          <div className='w-1/2 bg-red-600 text-white opacity-80 rounded-xl p-5'>
            <AlertTriangle className='w-6 h-6 inline-block mr-3'></AlertTriangle>
            <span>{warning}</span>
          </div>
        )}
        {onAir && (
          <>
            <div className='w-1/2 bg-yellow-600 text-white opacity-80 rounded-xl p-5 mb-5'>
              <AlertTriangle className='w-6 h-6 inline-block mr-3'></AlertTriangle>
              <span>
                If this page is turned off, the broadcast will also be turned
                off.
              </span>
            </div>
            <Button onClick={getLocalStream} className='mb-5'>
              Screen
            </Button>
            <div className='flex items-center gap-x-4 mb-5'>
              <p className='text-sm font-medium'>Video</p>
            </div>
            <video
              className='w-[600px] h-[400px] bg-black border'
              autoPlay
              playsInline
              muted
              ref={videoRef}
            />
          </>
        )}
      </div>
      {onAir && <Chat channelId={user.channel.id} />}
    </div>
  )
}

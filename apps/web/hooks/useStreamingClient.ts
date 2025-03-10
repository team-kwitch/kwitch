import { useEffect, useRef, useState } from "react"
import mediasoup from "mediasoup-client"
import { socket } from "@/lib/socket"
import { useAuth } from "@/components/provider/AuthProvider"
import { SOCKET_EVENTS } from "@/lib/const/socket"
import { Streaming, StreamingLayout } from "@kwitch/types"
import {
  createConsumer,
  createDevice,
  createProducer,
  createTransport,
} from "@/lib/mediasoup"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { set } from "react-hook-form"

const sourceType = {
  user$camera: "user$camera",
  user$mic: "user$mic",
  display$audio: "display$audio",
  display$video: "display$video",
} as const

export const useStreamingClient = () => {
  const { user, accessToken } = useAuth()
  const { toast } = useToast()

  const deviceRef = useRef<mediasoup.types.Device | null>(null)
  const sendTransportRef = useRef<mediasoup.types.Transport | null>(null)
  const recvTransportRef = useRef<mediasoup.types.Transport | null>(null)

  const producersRef = useRef<{
    [key: string]: mediasoup.types.Producer
  }>({})
  const consumersRef = useRef<{
    [key: string]: mediasoup.types.Consumer
  }>({})

  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isStreamingOnLive, setIsStreamingOnLive] = useState(false)

  const [userCameraTrack, setUserCameraTrack] =
    useState<MediaStreamTrack | null>(null)
  const [userMicTrack, setUserMicTrack] = useState<MediaStreamTrack | null>(
    null,
  )
  const [displayAudioTrack, setDisplayAudioTrack] =
    useState<MediaStreamTrack | null>(null)
  const [displayVideoTrack, setDisplayVideoTrack] =
    useState<MediaStreamTrack | null>(null)

  const startStreaming = async ({
    title,
    layout,
  }: {
    title: string
    layout: StreamingLayout
  }) => {
    if (!user || !socket.connected) throw new Error("Socket is not connected")

    const rtpCapabilities = await socket.emitWithAck(
      SOCKET_EVENTS.STREAMING_START,
      {
        title,
        layout,
      },
    )
    const device = await createDevice(rtpCapabilities)
    const sendTransport = await createTransport({
      socket,
      channelId: user.channel.id,
      device,
      isSender: true,
    })

    deviceRef.current = device
    sendTransportRef.current = sendTransport

    setIsStreamingOnLive(true)
  }

  const endStreaming = async () => {
    if (!user || !socket.connected) throw new Error("Socket is not connected")

    await socket.emitWithAck(SOCKET_EVENTS.STREAMING_END)
    deviceRef.current = null
    sendTransportRef.current = null
  }

  const updateStreaming = async ({
    title,
    layout,
  }: {
    title?: string
    layout?: StreamingLayout
  }) => {
    if (!user || !socket.connected) throw new Error("Socket is not connected")

    await socket.emitWithAck(SOCKET_EVENTS.STREAMING_UPDATE, {
      title,
      layout,
    })
  }

  const joinStreaming = async ({ channelId }: { channelId: string }) => {
    if (!socket.connected) throw new Error("Socket is not connected")

    console.debug("joinStreaming(), channelId: ", channelId)

    const streaming = (await socket.emitWithAck(
      SOCKET_EVENTS.STREAMING_JOIN,
      channelId,
    )) as Streaming

    const rtpCapabilities =
      streaming.rtpCapabilities as mediasoup.types.RtpCapabilities

    const device = await createDevice(rtpCapabilities)
    const recvTransport = await createTransport({
      socket,
      channelId,
      device,
      isSender: false,
    })

    const producers = await socket.emitWithAck(
      SOCKET_EVENTS.MEDIASOUP_GETALL_PRODUCER,
      channelId,
    )

    for (const producer of producers) {
      const consumer = await createConsumer({
        socket,
        channelId,
        producerId: producer.id,
        transport: recvTransport,
        rtpCapabilities,
      })

      switch (producer.appData.source) {
        case sourceType.user$camera:
          setUserCameraTrack(consumer.track)
          break
        case sourceType.user$mic:
          setUserMicTrack(consumer.track)
          break
        case sourceType.display$audio:
          setDisplayAudioTrack(consumer.track)
          break
        case sourceType.display$video:
          setDisplayVideoTrack(consumer.track)
          break
        default:
          console.error("Unknown producer source:", producer.appData.source)
          break
      }

      socket.emit(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
        channelId,
        consumerId: consumer.id,
      })
    }

    deviceRef.current = device
    recvTransportRef.current = recvTransport

    setIsStreamingOnLive(true)

    return streaming
  }

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      const track = stream.getVideoTracks()[0]!

      if (sendTransportRef.current) {
        const newProducer = await createProducer({
          transport: sendTransportRef.current,
          producerOptions: {
            track,
            appData: {
              source: sourceType.user$camera,
            },
          },
        })
        producersRef.current[newProducer.id] = newProducer
      }

      setUserCameraTrack(track)
    } catch (err: any) {
      toast({
        title: "Failed to enable camera",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const disableCamera = async () => {
    const producer = Object.values(producersRef.current).find(
      (producer) => producer.appData.source === "user$camera",
    )

    if (producer) {
      producer.close()
      await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        producerId: producer.id,
      })
      delete producersRef.current[producer.id]
    }

    if (userCameraTrack) {
      userCameraTrack.stop()
      setUserCameraTrack(null)
    }
  }

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const track = stream.getAudioTracks()[0]!

      if (sendTransportRef.current) {
        const newProducer = await createProducer({
          transport: sendTransportRef.current,
          producerOptions: {
            track,
            appData: {
              source: sourceType.user$mic,
            },
          },
        })
        producersRef.current[newProducer.id] = newProducer
      }

      setUserMicTrack(track)
    } catch (err: any) {
      toast({
        title: "Failed to enable microphone",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const disableMic = async () => {
    const producer = Object.values(producersRef.current).find(
      (producer) => producer.appData.source === "user$mic",
    )

    if (producer) {
      producer.close()
      await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        producerId: producer.id,
      })
      delete producersRef.current[producer.id]
    }

    if (userMicTrack) {
      userMicTrack.stop()
      setUserMicTrack(null)
    }
  }

  const enableDisplay = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      const audioTrack = stream.getAudioTracks()[0]!
      const videoTrack = stream.getVideoTracks()[0]!

      if (sendTransportRef.current) {
        const audioProducer = await createProducer({
          transport: sendTransportRef.current,
          producerOptions: {
            track: audioTrack,
            appData: {
              source: sourceType.display$audio,
            },
          },
        })
        producersRef.current[audioProducer.id] = audioProducer

        const videoProducer = await createProducer({
          transport: sendTransportRef.current,
          producerOptions: {
            track: videoTrack,
            appData: {
              source: sourceType.display$video,
            },
          },
        })
        producersRef.current[videoProducer.id] = videoProducer
      }

      setDisplayAudioTrack(audioTrack)
      setDisplayVideoTrack(videoTrack)
    } catch (err: any) {
      toast({
        title: "Failed to enable display",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const disableDisplay = async () => {
    const audioProducer = Object.values(producersRef.current).find(
      (producer) => producer.appData.source === "display$audio",
    )
    const videoProducer = Object.values(producersRef.current).find(
      (producer) => producer.appData.source === "display$video",
    )

    if (audioProducer) {
      audioProducer.close()
      await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        producerId: audioProducer.id,
      })
      delete producersRef.current[audioProducer.id]
    }

    if (videoProducer) {
      videoProducer.close()
      await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        producerId: videoProducer.id,
      })
      delete producersRef.current[videoProducer.id]
    }

    if (displayAudioTrack) {
      displayAudioTrack.stop()
      setDisplayAudioTrack(null)
    }

    if (displayVideoTrack) {
      displayVideoTrack.stop()
      setDisplayVideoTrack(null)
    }
  }

  useEffect(() => {
    socket.auth = {
      accessToken: `Bearer ${accessToken}`,
    }
    socket.connect()

    socket.on("connect", () => {
      setIsSocketConnected(true)
      console.log("socket connected")
    })

    socket.on("disconnect", () => {
      setIsSocketConnected(false)
      console.log("socket disconnected")
    })

    return () => {
      Object.values(producersRef.current).forEach((producer) => {
        producer.close()
      })
      Object.values(consumersRef.current).forEach((consumer) => {
        consumer.close()
      })

      userCameraTrack?.stop()
      userMicTrack?.stop()
      displayAudioTrack?.stop()
      displayVideoTrack?.stop()

      socket.off("connect")
      socket.off("disconnect")
      socket.disconnect()
    }
  }, [])

  return {
    isStreamingOnLive,
    isSocketConnected,
    userCameraTrack,
    userMicTrack,
    displayAudioTrack,
    displayVideoTrack,
    startStreaming,
    endStreaming,
    joinStreaming,
    updateStreaming,
    enableCamera,
    disableCamera,
    enableMic,
    disableMic,
    enableDisplay,
    disableDisplay,
  }
}

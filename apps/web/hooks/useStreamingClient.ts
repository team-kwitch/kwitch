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

  const producersRef = useRef<Map<string, mediasoup.types.Producer>>(new Map())
  const consumersRef = useRef<Map<string, mediasoup.types.Consumer>>(new Map())

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
    console.debug("startStreaming(), title: ", title, "layout: ", layout)

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

    const tracks = [
      userCameraTrack,
      userMicTrack,
      displayAudioTrack,
      displayVideoTrack,
    ]

    tracks.forEach(async (track) => {
      if (!track) return

      const newProducer = await createProducer({
        transport: sendTransport,
        producerOptions: {
          track,
          appData: {
            source: sourceType.user$camera,
          },
        },
      })
      producersRef.current.set(newProducer.id, newProducer)
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

    console.debug("joinStreaming(), received producers: ", producers)

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
      producersRef.current.set(newProducer.id, newProducer)
    }

    setUserCameraTrack(track)
  }

  const disableCamera = async () => {
    console.debug("disableCamera()")

    let cameraProducer: mediasoup.types.Producer | undefined
    for (const producer of producersRef.current.values()) {
      if (producer.appData.source === sourceType.user$camera) {
        cameraProducer = producer
      }
    }

    console.debug("disableCamera(), cameraProducer: ", cameraProducer)

    if (cameraProducer) {
      cameraProducer.close()
      socket.emit(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        channelId: user!.channel.id,
        producerId: cameraProducer.id,
      })
      producersRef.current.delete(cameraProducer.id)
    }

    if (userCameraTrack) {
      userCameraTrack.stop()
      setUserCameraTrack(null)
    }
  }

  const enableMic = async () => {
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
      producersRef.current.set(newProducer.id, newProducer)
    }

    setUserMicTrack(track)
  }

  const disableMic = async () => {
    console.debug("disableMic()")

    let micProducer: mediasoup.types.Producer | undefined
    for (const producer of producersRef.current.values()) {
      if (producer.appData.source === sourceType.user$mic) {
        micProducer = producer
      }
    }

    console.debug("disableMic(), micProducer: ", micProducer)

    if (micProducer) {
      micProducer.close()
      socket.emit(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        channelId: user!.channel.id,
        producerId: micProducer.id,
      })
      producersRef.current.delete(micProducer.id)
    }

    if (userMicTrack) {
      userMicTrack.stop()
      setUserMicTrack(null)
    }
  }

  const enableDisplay = async () => {
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
      producersRef.current.set(audioProducer.id, audioProducer)

      const videoProducer = await createProducer({
        transport: sendTransportRef.current,
        producerOptions: {
          track: videoTrack,
          appData: {
            source: sourceType.display$video,
          },
        },
      })
      producersRef.current.set(videoProducer.id, videoProducer)
    }

    setDisplayAudioTrack(audioTrack)
    setDisplayVideoTrack(videoTrack)
  }

  const disableDisplay = async () => {
    console.debug("disableDisplay()")

    let audioProducer: mediasoup.types.Producer | undefined
    let videoProducer: mediasoup.types.Producer | undefined

    for (const producer of producersRef.current.values()) {
      if (producer.appData.source === sourceType.display$audio) {
        audioProducer = producer
      } else if (producer.appData.source === sourceType.display$video) {
        videoProducer = producer
      }
    }

    console.debug(
      "disableDisplay(), audioProducer: ",
      audioProducer,
      "videoProducer: ",
      videoProducer,
    )

    if (audioProducer) {
      audioProducer.close()
      socket.emit(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        channelId: user!.channel.id,
        producerId: audioProducer.id,
      })
      producersRef.current.delete(audioProducer.id)
    }

    if (videoProducer) {
      videoProducer.close()
      socket.emit(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, {
        channelId: user!.channel.id,
        producerId: videoProducer.id,
      })
      producersRef.current.delete(videoProducer.id)
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

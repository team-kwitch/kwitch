import { useEffect, useRef, useState } from "react"
import mediasoup from "mediasoup-client"
import { socket } from "@/lib/socket"
import { useAuth } from "@/components/provider/AuthProvider"
import { SOCKET_EVENTS } from "@/lib/const/socket"
import { StreamingLayout } from "@kwitch/types"
import {
  createConsumer,
  createDevice,
  createProducer,
  createTransport,
} from "@/lib/mediasoup"
import { toast } from "@kwitch/ui/hooks/use-toast"

const sourceType = {
  user$camera: "user$camera",
  user$mic: "user$mic",
  display$audio: "display$audio",
  display$video: "display$video",
} as const

export const useStreamingClient = () => {
  const { user, accessToken } = useAuth()

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

  async function startStreaming({
    title,
    layout,
  }: {
    title: string
    layout: StreamingLayout
  }) {
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

  async function endStreaming() {
    if (!user || !socket.connected) throw new Error("Socket is not connected")

    console.debug("endStreaming()")

    socket.emit(SOCKET_EVENTS.STREAMING_END)

    producersRef.current.forEach((producer) => {
      producer.close()
    })
    sendTransportRef.current = null
    deviceRef.current = null

    setIsStreamingOnLive(false)
  }

  async function updateStreaming({
    title,
    layout,
  }: {
    title?: string
    layout?: StreamingLayout
  }) {
    if (!user || !socket.connected) throw new Error("Socket is not connected")

    await socket.emitWithAck(SOCKET_EVENTS.STREAMING_UPDATE, {
      title,
      layout,
    })
  }

  async function joinStreaming({ channelId }: { channelId: string }) {
    if (!socket.connected) throw new Error("Socket is not connected")

    console.debug("joinStreaming(), channelId: ", channelId)

    const streaming = await socket.emitWithAck(SOCKET_EVENTS.STREAMING_JOIN, {
      channelId,
    })

    console.debug("joinStreaming(), streaming: ", streaming)

    const device = await createDevice(streaming.rtpCapabilities)
    const recvTransport = await createTransport({
      socket,
      channelId,
      device,
      isSender: false,
    })

    const producerIds = streaming.producerIds

    Promise.all(
      producerIds.map(async (producerId: string) => {
        const consumer = await createConsumer({
          socket,
          channelId,
          transport: recvTransport,
          producerId: producerId,
          rtpCapabilities: device.rtpCapabilities,
        })

        console.debug("joinStreaming(), consumer: ", consumer)

        consumersRef.current.set(consumer.id, consumer)

        _setTrack(consumer)
      }),
    )

    deviceRef.current = device
    recvTransportRef.current = recvTransport

    setIsStreamingOnLive(true)

    return streaming
  }

  async function enableCamera() {
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

  async function disableCamera() {
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

  async function enableMic() {
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

  async function disableMic() {
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

  async function enableDisplay() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })
    const audioTrack = stream.getAudioTracks()[0]
    const videoTrack = stream.getVideoTracks()[0]

    if (sendTransportRef.current) {
      if (audioTrack) {
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
        setDisplayAudioTrack(audioTrack)
      }

      if (videoTrack) {
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
        setDisplayVideoTrack(videoTrack)
      }
    }
  }

  async function disableDisplay() {
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

  function _setTrack(consumer: mediasoup.types.Consumer) {
    switch (consumer.appData.source) {
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
    }
  }

  function _setTrackToNull(consumer: mediasoup.types.Consumer) {
    switch (consumer.appData.source) {
      case sourceType.user$camera:
        setUserCameraTrack(null)
        break
      case sourceType.user$mic:
        setUserMicTrack(null)
        break
      case sourceType.display$audio:
        setDisplayAudioTrack(null)
        break
      case sourceType.display$video:
        setDisplayVideoTrack(null)
        break
    }
  }

  function _clear() {
    producersRef.current.forEach((producer) => {
      producer.close()
    })
    consumersRef.current.forEach((consumer) => {
      consumer.close()
    })

    producersRef.current.clear()
    consumersRef.current.clear()

    setIsSocketConnected(false)
    setIsStreamingOnLive(false)
    setUserCameraTrack(null)
    setUserMicTrack(null)
    setDisplayAudioTrack(null)
    setDisplayVideoTrack(null)
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

    socket.on(SOCKET_EVENTS.MEDIASOUP_PRODUCER, async (producerId) => {
      console.debug("socket.on(MEDIASOUP_PRODUCER), producerId: ", producerId)

      if (!user) return
      if (!deviceRef.current) return
      if (!recvTransportRef.current) return

      const consumer = await createConsumer({
        socket,
        channelId: user.channel.id,
        transport: recvTransportRef.current,
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      })

      console.debug(
        "socket.on(MEDIASOUP_CREATE_TRANSPORT), consumer: ",
        consumer,
      )

      consumersRef.current.set(consumer.id, consumer)
      _setTrack(consumer)
    })

    socket.on(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER, (producerSourceType) => {
      console.debug(
        "socket.on(MEDIASOUP_CLOSE_PRODUCER), producerSourceType: ",
        producerSourceType,
      )

      const consumer = consumersRef.current.values().find((consumer) => {
        return consumer.appData.source === producerSourceType
      })

      if (consumer) {
        consumer.close()
        consumersRef.current.delete(consumer.id)
        _setTrackToNull(consumer)
      }
    })

    socket.on(SOCKET_EVENTS.STREAMING_END, () => {
      console.debug("socket.on(STREAMING_END)")

      _clear()

      toast({
        title: "Streaming ended",
        description: "The streaming has ended.",
        variant: "destructive",
        duration: 3000,
      })
    })

    return () => {
      _clear()
      socket.off("connect")
      socket.off("disconnect")
      socket.off(SOCKET_EVENTS.MEDIASOUP_PRODUCER)
      socket.off(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER)
      socket.off(SOCKET_EVENTS.STREAMING_END)
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

"use client"

import { useRef, useState } from "react"

import { Button } from "@kwitch/ui/components/button"
import { Input } from "@kwitch/ui/components/input"
import { Label } from "@kwitch/ui/components/label"
import { SignalIcon } from "@heroicons/react/20/solid"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { useAuth } from "@/components/provider/AuthProvider"
import { useSocket } from "@/components/provider/socket-provider"
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
import { ChatComponent } from "@/components/channels/Chat"

export default function StreamManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [layout, setLayout] = useState<StreamingLayout>("both")
  const displayVideoRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)

  // const sendTransportRef = useRef<mediasoup.types.Transport | null>(null)
  // const producersRef = useRef<{
  //   user: {
  //     video: mediasoup.types.Producer | null
  //     audio: mediasoup.types.Producer | null
  //   }
  //   display: {
  //     video: mediasoup.types.Producer | null
  //     audio: mediasoup.types.Producer | null
  //   }
  // }>({
  //   user: {
  //     video: null,
  //     audio: null,
  //   },
  //   display: {
  //     video: null,
  //     audio: null,
  //   },
  // })
  // const tracksRef = useRef<{
  //   user: {
  //     video: MediaStreamTrack
  //     audio: MediaStreamTrack
  //   }
  //   display: {
  //     video: MediaStreamTrack
  //     audio: MediaStreamTrack
  //   }
  // }>({
  //   user: {
  //     video: createEmptyVideoTrack(),
  //     audio: createEmptyAudioTrack(),
  //   },
  //   display: {
  //     video: createEmptyVideoTrack(),
  //     audio: createEmptyAudioTrack(),
  //   },
  // })

  const [title, setTitle] = useState("")
  const [onAir, setOnAir] = useState(false)

  const [isScreenPaused, setIsScreenPaused] = useState(true)
  const [isMicPaused, setIsMicPaused] = useState(true)
  const [isCameraPaused, setIsCameraPaused] = useState(true)

  // const startStreaming = (title: string) => {
  //   if (!user || !socket) return

  //   socket.emit(
  //     SOCKET_EVENTS.STREAMING_START,
  //     { title, layout },
  //     async (_rtpCapabilities: RtpCapabilities) => {
  //       const device = await createDevice(_rtpCapabilities)
  //       const sendTransport = await createTransport({
  //         socket,
  //         channelId: user.channel.id,
  //         device,
  //         isSender: true,
  //       })

  //       Object.entries(tracksRef.current).forEach(([key, track]) => {
  //         Object.values(track).forEach((track) => {
  //           console.debug("createProducerAndSetUp(), track: ", track)
  //           if (track) {
  //             createProducerAndSetUp({
  //               track,
  //               transport: sendTransport,
  //               source: key as "display" | "user",
  //             }).then((producer) => {
  //               producersRef.current[key as "display" | "user"][
  //                 track.kind as "audio" | "video"
  //               ] = producer
  //             })
  //           }
  //         })
  //       })

  //       sendTransportRef.current = sendTransport

  //       setOnAir(true)
  //     },
  //   )
  // }

  // const updateStreaming = (layout: string) => {
  //   if (!user || !socket) return

  //   if (isStreamingLayout(layout)) {
  //     setLayout(layout)
  //     socket.emit(SOCKET_EVENTS.STREAMING_UPDATE, { title, layout })
  //   }
  // }

  // const createProducerAndSetUp = async ({
  //   track,
  //   transport: sendTransport,
  //   source,
  // }: {
  //   track: MediaStreamTrack
  //   transport: mediasoup.types.Transport
  //   source: "display" | "user"
  // }) => {
  //   const producer = await createProducer({
  //     transport: sendTransport,
  //     producerOptions: {
  //       track,
  //       appData: {
  //         source,
  //       },
  //     },
  //   })

  //   const index = `${track.kind}-${source}`
  //   switch (index) {
  //     case "video-display":
  //       producersRef.current.display.video = producer
  //       break
  //     case "audio-display":
  //       producersRef.current.display.audio = producer
  //       break
  //     case "video-user":
  //       producersRef.current.user.video = producer
  //       break
  //     case "audio-user":
  //       producersRef.current.user.audio = producer
  //       break
  //   }

  //   return producer
  // }

  // const enableDisplay = async () => {
  //   if (!displayVideoRef.current) {
  //     return
  //   }

  //   console.debug("enableDisplay()")

  //   const newMediaStream = new MediaStream()

  //   try {
  //     const stream = await navigator.mediaDevices.getDisplayMedia({
  //       audio: true,
  //       video: {
  //         width: { ideal: 1920 },
  //         height: { ideal: 1080 },
  //         aspectRatio: 16 / 9,
  //       },
  //     })

  //     const videoTrack = stream.getVideoTracks()[0]
  //     const audioTrack = stream.getAudioTracks()[0]

  //     if (videoTrack) {
  //       tracksRef.current.display.video = videoTrack
  //       newMediaStream.addTrack(videoTrack)
  //       producersRef.current.display.video?.replaceTrack({
  //         track: videoTrack,
  //       })
  //     } else {
  //       newMediaStream.addTrack(createEmptyVideoTrack())
  //     }

  //     if (audioTrack) {
  //       tracksRef.current.display.audio = audioTrack
  //       newMediaStream.addTrack(audioTrack)
  //       producersRef.current.display.audio?.replaceTrack({
  //         track: audioTrack,
  //       })
  //     } else {
  //       newMediaStream.addTrack(createEmptyAudioTrack())
  //     }

  //     displayVideoRef.current.srcObject = newMediaStream

  //     setIsScreenPaused(false)
  //   } catch (err: any) {
  //     console.error(err)
  //   }
  // }

  // const disableDisplay = () => {
  //   if (!displayVideoRef.current) {
  //     return
  //   }

  //   console.debug("disableDisplay()")

  //   const stream = displayVideoRef.current.srcObject as MediaStream
  //   stream.getTracks().forEach((track) => {
  //     track.stop()
  //   })
  //   displayVideoRef.current.srcObject = null

  //   producersRef.current.display.video?.replaceTrack({
  //     track: createEmptyVideoTrack(),
  //   })
  //   producersRef.current.display.audio?.replaceTrack({
  //     track: createEmptyAudioTrack(),
  //   })

  //   setIsScreenPaused(true)
  // }

  // const enableMic = async () => {
  //   if (!userAudioRef.current) {
  //     return
  //   }

  //   console.debug("enableMic()")

  //   const userAudioInput = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //   })

  //   const audioTrack = userAudioInput.getAudioTracks()[0]

  //   if (audioTrack) {
  //     tracksRef.current.user.audio = audioTrack
  //     producersRef.current.user.audio?.replaceTrack({
  //       track: audioTrack,
  //     })
  //   }

  //   userAudioRef.current.srcObject = userAudioInput

  //   setIsMicPaused(false)
  // }

  // const disableMic = () => {
  //   if (!userAudioRef.current) {
  //     return
  //   }

  //   console.debug("disableMic()")

  //   const stream = userAudioRef.current.srcObject as MediaStream
  //   stream.getTracks().forEach((track) => {
  //     track.stop()
  //   })
  //   userAudioRef.current.srcObject = null

  //   producersRef.current.user.audio?.replaceTrack({
  //     track: null,
  //   })

  //   setIsMicPaused(true)
  // }

  // const enableCamera = async () => {
  //   if (!userVideoRef.current) {
  //     return
  //   }

  //   console.debug("enableCamera()")

  //   try {
  //     const userVideoInput = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         width: { ideal: 640 },
  //         height: { ideal: 360 },
  //         aspectRatio: 16 / 9,
  //       },
  //     })

  //     const videoTrack = userVideoInput.getVideoTracks()[0]

  //     if (videoTrack) {
  //       tracksRef.current.user.video = videoTrack
  //       producersRef.current.user.video?.replaceTrack({
  //         track: videoTrack,
  //       })
  //     }

  //     userVideoRef.current.srcObject = userVideoInput

  //     setIsCameraPaused(false)
  //   } catch (err: any) {
  //     console.error(err)
  //   }
  // }

  // const disableCamera = () => {
  //   if (!userVideoRef.current) {
  //     return
  //   }

  //   console.debug("disableCamera()")

  //   const stream = userVideoRef.current.srcObject as MediaStream
  //   stream.getTracks().forEach((track) => {
  //     track.stop()
  //   })
  //   userVideoRef.current.srcObject = null

  //   producersRef.current.user.video?.replaceTrack({
  //     track: null,
  //   })

  //   setIsCameraPaused(true)
  // }

  // useEffect(() => {
  //   return () => {
  //     if (!onAir) return

  //     setOnAir(false)

  //     toast({
  //       title: "Streaming ended",
  //       description: "The streaming has ended successfully.",
  //       variant: "success",
  //     })
  //   }
  // }, [onAir])

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
            <Button disabled={!title || onAir} className='mr-3'>
              Start
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-x-4 mb-5'>
          <Button variant={isScreenPaused ? "outline" : "default"}>
            <ComputerDesktopIcon className='size-5' />
          </Button>
          <Button variant={isMicPaused ? "outline" : "default"}>
            <MicrophoneIcon className='size-5' />
          </Button>
          <Button variant={isCameraPaused ? "outline" : "default"}>
            <VideoCameraIcon className='size-5' />
          </Button>
        </div>
        <Select value={layout}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='both'>Both</SelectItem>
            <SelectItem value='camera'>Camera</SelectItem>
            <SelectItem value='display'>Display</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChatComponent user={user} socket={socket} channelId={user.channel.id} />
    </div>
  )
}

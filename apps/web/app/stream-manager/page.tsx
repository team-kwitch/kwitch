"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@kwitch/ui/components/button"
import { Input } from "@kwitch/ui/components/input"
import { Label } from "@kwitch/ui/components/label"
import { SignalIcon } from "@heroicons/react/20/solid"
import { toast, useToast } from "@kwitch/ui/hooks/use-toast"
import { useAuth } from "@/components/provider/AuthProvider"
import {
  ComputerDesktopIcon,
  MicrophoneIcon,
  SignalSlashIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid"
import { isStreamingLayout, StreamingLayout } from "@kwitch/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kwitch/ui/components/select"
import { ChatComponent } from "@/components/channels/Chat"
import { useStreamingClient } from "@/hooks/useStreamingClient"
import { socket } from "@/lib/socket"

export default function StreamManager() {
  const { user } = useAuth()
  const {
    isStreamingOnLive,
    userCameraTrack,
    userMicTrack,
    displayAudioTrack,
    displayVideoTrack,
    startStreaming,
    updateStreaming,
    enableCamera,
    disableCamera,
    enableMic,
    disableMic,
    enableDisplay,
    disableDisplay,
  } = useStreamingClient()

  const displayRef = useRef<HTMLVideoElement | null>(null)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)

  const [title, setTitle] = useState("")
  const [layout, setLayout] = useState<StreamingLayout>("both")

  const [isScreenPaused, setIsScreenPaused] = useState(true)
  const [isMicPaused, setIsMicPaused] = useState(true)
  const [isCameraPaused, setIsCameraPaused] = useState(true)

  useEffect(() => {
    if (!userCameraTrack || !userVideoRef.current) {
      return
    }
    userVideoRef.current.srcObject = new MediaStream([userCameraTrack])
  }, [userCameraTrack])

  useEffect(() => {
    if (!userMicTrack || !userAudioRef.current) {
      return
    }
    userAudioRef.current.srcObject = new MediaStream([userMicTrack])
  }, [userMicTrack])

  useEffect(() => {
    if (!displayRef.current) {
      return
    }

    const newMediaStream = new MediaStream()

    if (displayVideoTrack) {
      newMediaStream.addTrack(displayVideoTrack)
    }

    if (displayAudioTrack) {
      newMediaStream.addTrack(displayAudioTrack)
    }

    displayRef.current.srcObject = newMediaStream
  }, [displayVideoTrack, displayAudioTrack])

  return (
    <div className='h-full flex gap-x-4 mx-4'>
      <div className='w-full max-w-7xl mx-auto overflow-y-auto scrollbar-hidden flex flex-col mt-8'>
        <div className='flex items-center gap-x-3 mb-5'>
          <span className='text-xl font-bold'>Preview</span>
          {isStreamingOnLive ? (
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
            ref={displayRef}
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
            disabled={isStreamingOnLive}
            className='w-64'
          />
          <div className='flex items-center gap-x-3'>
            <Button
              disabled={!title || isStreamingOnLive}
              onClick={() => startStreaming({ title, layout })}
              className='mr-3'
            >
              Start
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-x-4 mb-5'>
          <Button
            variant={isScreenPaused ? "outline" : "default"}
            onClick={async () => {
              try {
                if (isScreenPaused) {
                  await enableDisplay()
                  setIsScreenPaused(false)
                } else {
                  await disableDisplay()
                  setIsScreenPaused(true)
                }
              } catch (err: any) {
                toast({
                  title: "Failed to share screen",
                  description: err.message,
                  variant: "destructive",
                })
              }
            }}
          >
            <ComputerDesktopIcon className='size-5' />
          </Button>
          <Button
            variant={isCameraPaused ? "outline" : "default"}
            onClick={async () => {
              try {
                if (isCameraPaused) {
                  await enableCamera()
                  setIsCameraPaused(false)
                } else {
                  await disableCamera()
                  setIsCameraPaused(true)
                }
              } catch (err: any) {
                toast({
                  title: "Failed to enable camera",
                  description: err.message,
                  variant: "destructive",
                })
              }
            }}
          >
            <VideoCameraIcon className='size-5' />
          </Button>
          <Button
            variant={isMicPaused ? "outline" : "default"}
            onClick={async () => {
              try {
                if (isMicPaused) {
                  await enableMic()
                  setIsMicPaused(false)
                } else {
                  await disableMic()
                  setIsMicPaused(true)
                }
              } catch (err: any) {
                toast({
                  title: "Failed to enable microphone",
                  description: err.message,
                  variant: "destructive",
                })
              }
            }}
          >
            <MicrophoneIcon className='size-5' />
          </Button>
        </div>
        <Select
          value={layout}
          onValueChange={(value) => {
            if (isStreamingLayout(value)) {
              updateStreaming({ layout: value }).then(() => setLayout(value))
            }
          }}
        >
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
      <ChatComponent user={user} socket={socket} channelId={user!.channel.id} />
    </div>
  )
}

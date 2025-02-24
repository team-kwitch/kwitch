"use client"

import { useEffect, useState } from "react"

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid"
import { ArrowPathIcon } from "@heroicons/react/24/solid"
import ChannelNavItem from "./channel-nav-item"
import { APICall } from "@/lib/axios"
import { APIResponse, Streaming } from "@kwitch/types"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { API_ROUTES } from "@/const/api"

const COUNTDOWN_INTERVAL = 60

export default function ChannelNav() {
  const { toast } = useToast()
  const [foldNav, setFoldNav] = useState(false)
  const [streamings, setStreamings] = useState<Streaming[]>([])
  const [countDown, setCountDown] = useState(COUNTDOWN_INTERVAL)

  const fetchStreamings = async () => {
    const res = await APICall.get(API_ROUTES.STREAMING.GETALL.url)
    const data = res.data as APIResponse<Streaming[]>
    if (data.success) {
      const streamings = data.content
      setStreamings(streamings)
    } else {
      toast({
        title: "Failed to fetch live channels",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchStreamings()

    const interval = setInterval(() => {
      setCountDown((prev) => {
        const nextTime = prev === 1 ? COUNTDOWN_INTERVAL : prev - 1
        if (nextTime === COUNTDOWN_INTERVAL) fetchStreamings()
        return nextTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`bg-secondary xl:min-w-80 ${
        foldNav ? "!min-w-0" : "xl:w-80"
      } flex flex-col`}
    >
      {foldNav && (
        <ArrowRightCircleIcon
          className='w-8 h-8 m-3 cursor-pointer hidden xl:block'
          onClick={() => setFoldNav(false)}
        />
      )}
      <div
        className={`hidden ${
          foldNav ? "" : "xl:flex"
        } justify-between items-center p-3`}
      >
        <p className='font-bold'>Live Channel List</p>
        <div className='flex items-center gap-2'>
          <ArrowPathIcon className='w-6 h-6 text-blue-500 animate-spin' />
          <span className='text-sm text-gray-500'>{countDown}s</span>
        </div>
        <ArrowLeftCircleIcon
          className='w-6 h-6 cursor-pointer'
          onClick={() => setFoldNav(true)}
        />
      </div>
      {streamings.map((streaming) => (
        <ChannelNavItem
          key={streaming.streamer.id}
          streaming={streaming}
          foldNav={foldNav}
        />
      ))}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid"
import ChannelNavItem from "./channel-nav-item"
import { api } from "@/lib/axios"
import { CustomResponse, Streaming } from "@kwitch/domain"
import { useToast } from "../ui/use-toast"

export default function ChannelNav() {
  const { toast } = useToast()
  const [foldNav, setFoldNav] = useState(false)
  const [streamings, setStreamings] = useState<Streaming[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    const fetchStreamings = async () => {
      const res = await api.get("/api/streamings")
      const data = res.data as CustomResponse
      console.log(data)
      if (data.success) {
        const { streamings } = data.content
        setStreamings(streamings)

        timer = setTimeout(() => fetchStreamings(), 10000)
      } else {
        toast({
          title: "Failed to fetch live channels",
          variant: "destructive",
        })
      }
    }

    fetchStreamings()

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={`border-r bg-gray-200 dark:bg-gray-900 min-w-[56px] ${
        foldNav ? "" : "xl:w-80"
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
        <ArrowLeftCircleIcon
          className='w-6 h-6 cursor-pointer'
          onClick={() => setFoldNav(true)}
        />
      </div>
      {streamings.map((streaming) => (
        <ChannelNavItem
          key={streaming.streamer.channel.id}
          streaming={streaming}
          foldNav={foldNav}
        />
      ))}
    </div>
  )
}

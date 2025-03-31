"use client"

import { use, useState } from "react"

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid"
import { ChannelNavItem } from "./ChannelNavItem"
import { Streaming } from "@kwitch/types"
import { useRouter } from "next/navigation"

export const ChannelNav = ({
  streamings: streamingsPromise,
}: {
  streamings: Promise<Streaming[]>
}) => {
  const streamings = use(streamingsPromise)
  const router = useRouter()

  const [foldNav, setFoldNav] = useState(false)

  return (
    <div
      className={`bg-secondary xl:min-w-80 ${
        foldNav ? "!min-w-0" : "xl:w-80"
      } flex flex-col rounded-tr-xl`}
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
          key={streaming.streamer.id}
          streaming={streaming}
          foldNav={foldNav}
          onClick={() => {
            setFoldNav(true)
            router.push(`/channels/${streaming.streamer.username}`)
          }}
        />
      ))}
    </div>
  )
}

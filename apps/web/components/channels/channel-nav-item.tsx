"use client"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@kwitch/ui/components/avatar"
import { useRouter } from "next/navigation"
import { Streaming } from "@kwitch/types"
import { Dot } from "@kwitch/ui/components/dot"

export default function ChannelNavItem({
  streaming,
  foldNav,
}: {
  streaming: Streaming
  foldNav: boolean
}) {
  const router = useRouter()

  return (
    <button
      type='button'
      onClick={() => router.push(`/channels/${streaming.streamer.channel.id}`)}
    >
      <div className='flex p-3 items-center'>
        <Avatar className='border-2 border-red-500 w-8 h-8'>
          <AvatarImage src={undefined} />
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        {!foldNav && (
          <div className='flex-1 hidden xl:block pl-3'>
            <div className='flex justify-between gap-x-5'>
              <p className='font-bold text-md'>{streaming.streamer.username}</p>
              <div className='flex items-center'>
                <Dot size={24} color='red' />
                <span className='text-sm'>{streaming.viewerCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

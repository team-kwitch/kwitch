"use client"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@kwitch/ui/components/avatar"
import { Streaming } from "@kwitch/types"
import { Dot } from "lucide-react"

export const ChannelNavItem = ({
  streaming,
  foldNav,
  onClick,
}: {
  streaming: Streaming
  foldNav: boolean
  onClick: () => void
}) => {
  return (
    <button type='button' onClick={onClick}>
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

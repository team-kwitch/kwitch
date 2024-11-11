"use client"

import { EyeIcon } from "@heroicons/react/20/solid"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Streaming } from "@kwitch/domain"

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
      <div className='flex p-3 items-center xl:border-b'>
        <Avatar className='border-2 border-red-500 w-8 h-8'>
          <AvatarImage src={streaming.streamer.channel.imageUrl || undefined} />
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        {!foldNav && (
          <div className='flex-1 hidden xl:block pl-3'>
            <div className='flex justify-between gap-x-5'>
              <div className='flex flex-col items-start'>
                <p className='font-bold text-md'>{streaming.title}</p>
                <span className='text-sm text-gray-500'>
                  {streaming.streamer.channel.name}
                </span>
              </div>
              <div className='flex items-center'>
                <EyeIcon className='w-4 h-4 text-gray-500 mr-1' />
                <span className='text-sm'>{"1"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

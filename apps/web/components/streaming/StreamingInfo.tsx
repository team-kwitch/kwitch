import { Streaming } from "@kwitch/types"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@kwitch/ui/components/avatar"
import { EyeIcon } from "@heroicons/react/24/solid"

export const StreamingInfo = ({ streaming }: { streaming: Streaming }) => {
  return (
    <div className='flex gap-x-6 p-4'>
      <Avatar className='border-2 border-red-500 w-24 h-24'>
        <AvatarImage src={undefined} />
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
      <div className='flex flex-col items-start my-auto'>
        <p className='text-center font-bold'>{streaming.title}</p>
        <span className='text-center text-gray-500'>
          {streaming.streamer.channel.id}
        </span>
        <div className='flex items-center'>
          <EyeIcon className='w-4 h-4 text-gray-500 mr-1' />
          <span className='text-sm'>{streaming.viewerCount}</span>
        </div>
      </div>
    </div>
  )
}

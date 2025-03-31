import { Dot } from "lucide-react"
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid"
import { Skeleton } from "@kwitch/ui/components/skeleton"

const ChannelNavItemSkeleton = () => {
  return (
    <button type='button'>
      <div className='flex p-3 gap-x-3 items-center'>
        <Skeleton className='w-8 h-8 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[250px]' />
          <Skeleton className='h-4 w-[200px]' />
        </div>
      </div>
    </button>
  )
}

export const ChannelNavSkeleton = () => {
  return (
    <div className='bg-secondary xl:w-80 flex flex-col rounded-tr-xl'>
      <div className='flex justify-between items-center p-3'>
        <p className='font-bold'>Live Channel List</p>
        <ArrowLeftCircleIcon className='w-6 h-6 cursor-pointer' />
      </div>
      <div className='flex flex-col'>
        {[1, 2, 3, 4, 5].map((i) => (
          <ChannelNavItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

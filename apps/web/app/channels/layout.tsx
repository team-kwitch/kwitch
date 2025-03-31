import { ChannelNav } from "@/components/channels/ChannelNav"
import { ChannelNavSkeleton } from "@/components/channels/ChannelNavSkeleton"
import { APICall } from "@/lib/axios"
import { API_ROUTES } from "@/lib/const/api"
import { Streaming } from "@kwitch/types"
import { Suspense } from "react"

const fetchStreamings = async () => {
  const res = await APICall<Streaming[]>({
    uri: API_ROUTES.STREAMING.GETALL.uri,
    method: API_ROUTES.STREAMING.GETALL.method,
  })

  if (res.success) {
    return res.content
  } else {
    throw new Error("Failed to fetch live channels")
  }
}

export default async function ChannelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const streamings = fetchStreamings()

  return (
    <div className='w-full h-full flex'>
      <Suspense fallback={<ChannelNavSkeleton />}>
        <ChannelNav streamings={streamings} />
      </Suspense>
      {children}
    </div>
  )
}

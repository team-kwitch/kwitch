"use client"

import ChannelNav from "@/components/channels/channel-nav"

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='w-full h-full flex'>
      <ChannelNav />
      {children}
    </div>
  )
}

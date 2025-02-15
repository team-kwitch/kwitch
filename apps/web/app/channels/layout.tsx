"use client"

import ChannelNav from "@/components/channels/channel-nav"

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex-1 flex'>
      <ChannelNav />
      {children}
    </div>
  )
}

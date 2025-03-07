import { SocketProvider } from "@/components/provider/socket-provider"

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SocketProvider>
      <div className='w-full h-full flex gap-x-4 px-4 xxl:container'>
        {children}
      </div>
    </SocketProvider>
  )
}

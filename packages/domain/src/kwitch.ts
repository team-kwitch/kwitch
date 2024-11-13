export interface User {
  id: number
  username: string
  password: string
  channel: Channel
}

export interface Channel {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
}

export interface Chat {
  username: string
  message: string
  isAlert?: boolean
  isStreamer?: boolean
}

export interface Streaming {
  title: string
  roomId: string
  streamer: User
  viewerCount: number
}

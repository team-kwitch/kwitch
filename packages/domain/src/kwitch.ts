export interface User {
  id: number
  username: string
  password: string
  channel: Channel
}

export interface Channel {
  id: string
  isOnStreaming: boolean
  message: string
  profileImg: string | null
}

export interface Chat {
  username: string
  message: string
  isStreamer: boolean
}

export interface Streaming {
  title: string
  channelId: string
  roomId: string
  viewerCount: number
}

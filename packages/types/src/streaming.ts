import { User } from "./user"

export interface Streaming {
  title: string
  roomId: string
  viewerCount: number
  streamer: User
  rtpCapabilities: RTCRtpCapabilities
}

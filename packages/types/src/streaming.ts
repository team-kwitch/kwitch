import { User } from "./user"

export type StreamingLayout = "camera" | "screen" | "both"

export interface Streaming {
  title: string
  roomId: string
  viewerCount: number
  streamer: User
  layout: StreamingLayout
  rtpCapabilities: RTCRtpCapabilities
}

import { User } from "./user"

export type StreamingLayout = "camera" | "display" | "both"

const StreamingLayouts = ["camera", "display", "both"] as const

export const isStreamingLayout = (value: any): value is StreamingLayout =>
  StreamingLayouts.includes(value)

export interface Streaming {
  title: string
  roomId: string
  viewerCount: number
  streamer: User
  layout: StreamingLayout
  rtpCapabilities: RTCRtpCapabilities
}

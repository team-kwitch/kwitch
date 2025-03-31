import { User } from "./user"

export type StreamingLayout = "camera" | "display" | "both"

const StreamingLayouts = ["camera", "display", "both"]

export const isStreamingLayout = (value: string): value is StreamingLayout =>
  StreamingLayouts.includes(value)

export interface Streaming {
  title: string
  roomId: string
  viewerCount: number
  streamer: User | null
  layout: StreamingLayout
}

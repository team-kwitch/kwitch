import { StartStreamingDto } from "./dto/start-streaming.dto"
import { UpdateStreamingDto } from "./dto/update-streaming.dto"
import { Streaming, User } from "@kwitch/types"

export interface StreamingService {
  start({
    startStreamingDto,
    socketId,
    streamer,
  }: {
    startStreamingDto: StartStreamingDto
    socketId: string
    streamer: User
  }): Promise<Streaming>

  findAll(): Streaming[]

  findById(channelId: string): Streaming | null

  update({
    updateStreamingDto,
    channelId,
  }: {
    updateStreamingDto: UpdateStreamingDto
    channelId: string
  }): Streaming

  end(channelId: string): Streaming

  join(channelId: string): Streaming

  leave({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }): Streaming
}

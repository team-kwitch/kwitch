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
    streamer: Omit<User, "password">
  }): Promise<Streaming>

  findAll(): Streaming[]

  findById(channelId: string): Streaming | null

  update(updateStreamingDto: UpdateStreamingDto): Streaming

  end(channelId: string): Streaming

  join({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }): Streaming

  leave({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }): Streaming
}

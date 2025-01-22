import { Injectable } from "@nestjs/common"
import { StartStreamingDto } from "../dto/start-streaming.dto"
import { UpdateStreamingDto } from "../dto/update-streaming.dto"
import { Streaming } from "@kwitch/domain"

export interface StreamingService {
  start({
    startStreamingDto,
    channelId,
    socketId,
  }: {
    startStreamingDto: StartStreamingDto
    channelId: string
    socketId: string
  }): Promise<Streaming>

  findAll(): Streaming[]

  findOne({ channelId }: { channelId: string }): Streaming | null

  update({
    updateStreamingDto,
  }: {
    updateStreamingDto: UpdateStreamingDto
  }): Streaming

  end({ channelId }: { channelId: string }): Streaming

  join({ channelId }: { channelId: string }): Streaming

  leave({
    channelId,
    viewerSocketId,
  }: {
    channelId: string
    viewerSocketId: string
  }): Streaming
}

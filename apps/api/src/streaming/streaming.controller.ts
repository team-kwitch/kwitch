import { Controller, Get } from "@nestjs/common"
import type { APIResponse, Streaming } from "@kwitch/types"
import { StreamingService } from "./streaming.service"

@Controller("streaming")
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get()
  findAll(): APIResponse<Streaming[]> {
    return {
      success: true,
      content: this.streamingService.findAll(),
    }
  }

  @Get(":channelId")
  findById(channelId: string) {
    return this.streamingService.findById(channelId)
  }
}

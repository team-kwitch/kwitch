import { Controller, Get, Inject } from "@nestjs/common"
import { StreamingService } from "./streaming.service.interface"
import { ISTREAMING_SERVICE } from "./constant"
import { APIResponse, Streaming } from "@kwitch/types"

@Controller("streaming")
export class StreamingController {
  constructor(
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

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

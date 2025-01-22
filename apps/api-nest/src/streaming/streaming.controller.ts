import { Controller, Get, Inject } from "@nestjs/common"
import { StreamingService } from "./interfaces/streaming.service.interface"
import { ISTREAMING_SERVICE } from "./constant"

@Controller("streaming")
export class StreamingController {
  constructor(
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  @Get()
  findAll() {
    return this.streamingService.findAll()
  }

  @Get(":channelId")
  findOne(channelId: string) {
    return this.streamingService.findOne({ channelId })
  }
}

import { Module } from "@nestjs/common"
import { StreamingGateway } from "./streaming.gateway"
import { MediasoupModule } from "./mediasoup/mediasoup.module"
import { MediasoupStreamingService } from "./mediasoup/streaming/mediasoup-streaming.service"
import { ISTREAMING_SERVICE } from "./constant"
import { StreamingController } from "./streaming.controller"

@Module({
  imports: [MediasoupModule],
  controllers: [StreamingController],
  providers: [
    StreamingGateway,
    { provide: ISTREAMING_SERVICE, useClass: MediasoupStreamingService },
  ],
  exports: [ISTREAMING_SERVICE],
})
export class StreamingModule {}

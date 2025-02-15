import { Module } from "@nestjs/common"
import { StreamingGateway } from "./streaming.gateway"
import { MediasoupStreamingService } from "./mediasoup/mediasoup-streaming.service"
import { ISTREAMING_SERVICE } from "./constant"
import { StreamingController } from "./streaming.controller"
import { MediasoupGateway } from "./mediasoup/mediasoup.gateway"
import { WorkerService } from "./mediasoup/worker.service"
import { AuthModule } from "src/auth/auth.module"
import { UserModule } from "src/user/user.module"

@Module({
  imports: [AuthModule, UserModule],
  controllers: [StreamingController],
  providers: [
    StreamingGateway,
    MediasoupGateway,
    { provide: ISTREAMING_SERVICE, useClass: MediasoupStreamingService },
    WorkerService,
  ],
  exports: [ISTREAMING_SERVICE],
})
export class StreamingModule {}

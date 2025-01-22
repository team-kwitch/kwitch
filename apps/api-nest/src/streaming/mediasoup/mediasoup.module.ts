import { Module } from "@nestjs/common"
import { WorkerService } from "./worker/worker.service"
import { MediasoupStreamingService } from "./streaming/mediasoup-streaming.service"
import { MediasoupGateway } from './mediasoup.gateway';

@Module({
  providers: [WorkerService, MediasoupStreamingService, MediasoupGateway],
  exports: [WorkerService, MediasoupStreamingService],
})
export class MediasoupModule {}

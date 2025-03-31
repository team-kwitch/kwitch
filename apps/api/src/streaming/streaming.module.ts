import { Module } from "@nestjs/common"
import { StreamingGateway } from "./streaming.gateway"
import { StreamingService } from "./streaming.service"
import { StreamingController } from "./streaming.controller"
import { AuthModule } from "src/auth/auth.module"
import { UserModule } from "src/user/user.module"
import { WorkerService } from "./worker.service"

@Module({
  imports: [AuthModule, UserModule],
  controllers: [StreamingController],
  providers: [StreamingGateway, StreamingService, WorkerService],
  exports: [StreamingService],
})
export class StreamingModule {}

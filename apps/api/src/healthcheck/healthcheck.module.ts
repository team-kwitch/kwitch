import { Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { ConfigModule } from "@nestjs/config"
import { HealthcheckController } from "./healthcheck.controller"

@Module({
  imports: [TerminusModule],
  controllers: [HealthcheckController],
})
export class HealthCheckModule {}

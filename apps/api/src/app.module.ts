import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { AuthModule } from "./auth/auth.module"
import { UserModule } from "./user/user.module"
import { ChannelModule } from "./channel/channel.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { StreamingModule } from "./streaming/streaming.module"
import { ChatModule } from "./chat/chat.module"
import { ConfigModule } from "@nestjs/config"
import { typeOrmConfigs } from "./config/database.config"
import { mediasoupConfigs } from "./config/mediasoup.config"
import { appConfigs } from "./config/app.config"
import { authConfigs } from "./config/auth.config"
import { LoggingMiddleware } from "./common/middleware/logging.middleware"
import { HealthCheckModule } from "./healthcheck/healthcheck.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigs, authConfigs, mediasoupConfigs],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigs.asProvider()),
    AuthModule,
    UserModule,
    ChannelModule,
    StreamingModule,
    ChatModule,
    HealthCheckModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*")
  }
}

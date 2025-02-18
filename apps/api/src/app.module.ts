import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { LoggerModule } from "nestjs-pino"
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigs, authConfigs, mediasoupConfigs],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== "production" ? "debug" : "error",
        transport: {
          target:
            process.env.NODE_ENV !== "production" ? "pino-pretty" : undefined,
        },
      },
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigs.asProvider()),
    AuthModule,
    UserModule,
    ChannelModule,
    StreamingModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

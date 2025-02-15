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
import path from "path"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== "production" ? "debug" : "error",
        transport: {
          target:
            process.env.NODE_ENV !== "production" ? "pino-pretty" : undefined,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "kwitch",
      entities: [path.join(__dirname, "./**/*.entity{.ts,.js}")],
      synchronize: process.env.NODE_ENV !== "production",
      logger: "advanced-console",
      logging: process.env.NODE_ENV !== "production",
      migrations: ["src/migrations/**/*.ts"],
      migrationsTableName: "migrations",
    }),
    AuthModule,
    UserModule,
    ChannelModule,
    StreamingModule,
    ChatModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

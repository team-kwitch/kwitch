import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger } from "nestjs-pino"
import { ConfigService } from "@nestjs/config"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const configService = app.get(ConfigService)

  app.useLogger(app.get(Logger))
  app.setGlobalPrefix("/api")
  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "Cookie",
      "cache-control",
    ],
  })

  await app.listen(process.env.PORT ?? 8000)
}
bootstrap()

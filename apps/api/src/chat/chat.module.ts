import { Module } from "@nestjs/common"
import { ChatGateway } from "./chat.gateway"
import { ChatService } from "./chat.service"
import { StreamingModule } from "src/streaming/streaming.module"
import { AuthModule } from "src/auth/auth.module"

@Module({
  imports: [StreamingModule, AuthModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

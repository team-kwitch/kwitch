import { Module } from "@nestjs/common"
import { ChatGateway } from "./chat.gateway"
import { ChatService } from "./chat.service"
import { StreamingModule } from "src/streaming/streaming.module"

@Module({
  imports: [StreamingModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

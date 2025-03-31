import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets"
import type { SendChatDto } from "./dto/send-chat.dto"
import type { Server } from "socket.io"
import { ChatService } from "./chat.service"
import { EVENT_CHAT_SEND } from "./constant"
import { UseGuards } from "@nestjs/common"
import type { Chat, Principal } from "@kwitch/types"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"
import { StreamingService } from "src/streaming/streaming.service"

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly streamingService: StreamingService,
  ) {}

  @WebSocketServer()
  private server: Server

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(EVENT_CHAT_SEND)
  handleMessage(
    @MessageBody() sendChatDto: SendChatDto,
    @CurrentPrincipal() principal: Principal,
  ) {
    const streaming = this.streamingService.findById(sendChatDto.channelId)
    if (!streaming) {
      return
    }

    const filteredMessage = this.chatService.filterMessage(sendChatDto.message)
    const chat: Chat = {
      message: filteredMessage,
      username: principal.username,
      isStreamer: streaming.streamer.id === principal.sub,
    }

    this.server.to(streaming.roomId).emit(EVENT_CHAT_SEND, chat)
  }
}

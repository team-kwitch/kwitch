import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets"
import { SendChatDto } from "./dto/send-chat.dto"
import { Server, Socket } from "socket.io"
import { ChatService } from "./chat.service"
import { StreamingService } from "src/streaming/streaming.service.interface"
import { EVENT_CHAT_SEND } from "./constant"
import { Inject, UseGuards } from "@nestjs/common"
import { ISTREAMING_SERVICE } from "src/streaming/constant"
import { Chat, Principal } from "@kwitch/types"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  @WebSocketServer()
  private server: Server

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(EVENT_CHAT_SEND)
  handleMessage(
    @MessageBody() sendChatDto: SendChatDto,
    @CurrentPrincipal() principal: Principal,
  ): WsResponse<Chat> {
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

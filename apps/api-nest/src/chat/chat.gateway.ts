import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets"
import { SendChatDto } from "./dto/send-chat.dto"
import { Server, Socket } from "socket.io"
import { ChatService } from "./chat.service"
import { StreamingService } from "src/streaming/interfaces/streaming.service.interface"
import { EVENT_CHATS_SEND, EVENT_CHATS_SENT } from "./constant"
import { Chat, User } from "@kwitch/domain"
import { Inject, Logger } from "@nestjs/common"
import { ISTREAMING_SERVICE } from "src/streaming/constant"

@WebSocketGateway()
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name)

  constructor(
    private readonly chatService: ChatService,
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  @WebSocketServer()
  private readonly server: Server

  @SubscribeMessage(EVENT_CHATS_SEND)
  handleMessage(
    @MessageBody() sendChatDto: SendChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findOne({
      channelId: sendChatDto.channelId,
    })
    if (!streaming) {
      return
    }

    const user: User = {
      id: 1,
      username: "test",
      channel: {
        id: "testchannelid",
        isOnStreaming: false,
        message: "hi",
        profileImg: null,
      },
      password: "testpassword",
    }
    const filteredMessage = this.chatService.filterMessage(sendChatDto.message)
    const chat: Chat = {
      ...sendChatDto,
      username: user.username,
      isStreamer: streaming.channelId === user.channel.id,
    }
    this.server.to(streaming.roomId).emit(EVENT_CHATS_SENT, chat)
  }
}

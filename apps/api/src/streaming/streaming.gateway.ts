import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsResponse,
  WebSocketServer,
} from "@nestjs/websockets"
import { StreamingService } from "./streaming.service.interface"
import { StartStreamingDto } from "./dto/start-streaming.dto"
import { UpdateStreamingDto } from "./dto/update-streaming.dto"
import { Inject, Logger, UseGuards } from "@nestjs/common"
import {
  EVENT_STREAMING_END,
  EVENT_STREAMING_JOIN,
  EVENT_STREAMING_LEAVE,
  EVENT_STREAMING_START,
  EVENT_STREAMING_UPDATE,
  ISTREAMING_SERVICE,
} from "./constant"
import { Server, Socket } from "socket.io"
import { Principal, Streaming, User } from "@kwitch/types"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"
import { CurrentUser } from "src/auth/decorator/current-user.decorator"
import { UserService } from "src/user/user.service"
import { socketFlagsToFbs } from "mediasoup/node/lib/types"

@WebSocketGateway()
export class StreamingGateway {
  private readonly logger = new Logger(StreamingGateway.name)

  constructor(
    private readonly userService: UserService,
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  @WebSocketServer()
  private server: Server

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(EVENT_STREAMING_START)
  async start(
    @MessageBody() startStreamingDto: StartStreamingDto,
    @ConnectedSocket() client: Socket,
    @CurrentUser() principal: Principal,
  ) {
    const user = await this.userService.findById(principal.sub)
    const streaming = await this.streamingService.start({
      startStreamingDto,
      socketId: client.id,
      streamer: user,
    })
    client.join(streaming.roomId)
    this.logger.log(
      `Streaming started. roomId: ${streaming.roomId}, title: ${streaming.title}`,
    )
    return { ...streaming.rtpCapabilities }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(EVENT_STREAMING_UPDATE)
  update(@MessageBody() updateStreamingDto: UpdateStreamingDto): Streaming {
    return this.streamingService.update(updateStreamingDto)
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage(EVENT_STREAMING_END)
  async end(@CurrentUser() principal: Principal) {
    const user = await this.userService.findById(principal.sub)
    return this.streamingService.end(user.channel.id)
  }

  @SubscribeMessage(EVENT_STREAMING_JOIN)
  join(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    const streaming = this.streamingService.join(channelId)
    client.join(streaming.roomId)
    this.server
      .to(streaming.roomId)
      .emit(EVENT_STREAMING_JOIN, streaming.streamer.username)
    return streaming
  }

  @SubscribeMessage(EVENT_STREAMING_LEAVE)
  leave(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    const streaming = this.streamingService.leave({
      channelId,
      viewerSocketId: client.id,
    })
    client.leave(streaming.roomId)
    this.server
      .to(streaming.roomId)
      .emit(EVENT_STREAMING_LEAVE, streaming.streamer.username)
    return streaming
  }
}

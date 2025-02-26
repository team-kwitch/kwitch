import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets"
import { StreamingService } from "./streaming.service.interface"
import { StartStreamingDto } from "./dto/start-streaming.dto"
import { UpdateStreamingDto } from "./dto/update-streaming.dto"
import {
  Inject,
  Logger,
  UseGuards,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common"
import {
  EVENT_STREAMING_END,
  EVENT_STREAMING_JOIN,
  EVENT_STREAMING_LEAVE,
  EVENT_STREAMING_START,
  EVENT_STREAMING_UPDATE,
  ISTREAMING_SERVICE,
} from "./constant"
import { Server, Socket } from "socket.io"
import { Principal } from "@kwitch/types"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"
import { UserService } from "src/user/user.service"
import { WebSocketLoggingInterceptor } from "src/common/interceptor/websocket-logging.interceptor"

@WebSocketGateway()
@UseInterceptors(WebSocketLoggingInterceptor)
export class StreamingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(StreamingGateway.name)

  constructor(
    private readonly userService: UserService,
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`)

    client.on("disconnecting", () => {
      this.logger.log(`Client disconnected: ${client.id}`)

      const principal = client.request.principal

      client.rooms.forEach((roomId, _) => {
        if (roomId === client.id) return

        if (principal && roomId === `${principal.username}\\${client.id}`) {
          this.streamingService.end(principal.username)
          this.server.to(roomId).emit(EVENT_STREAMING_END)
        } else {
          const channelId = roomId.split("\\")[0]
          this.streamingService.leave({
            channelId: channelId,
            viewerSocketId: client.id,
          })
          if (principal) {
            this.server
              .to(roomId)
              .emit(EVENT_STREAMING_LEAVE, principal.username)
          }
        }
      })
    })
  }

  @WebSocketServer()
  private server: Server

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(EVENT_STREAMING_START)
  async start(
    @MessageBody() startStreamingDto: StartStreamingDto,
    @ConnectedSocket() client: Socket,
    @CurrentPrincipal() principal: Principal,
  ) {
    const user = await this.userService.findById(principal.sub)
    const streaming = await this.streamingService.start({
      startStreamingDto,
      socketId: client.id,
      streamer: user,
    })
    client.join(streaming.roomId)
    return { ...streaming.rtpCapabilities }
  }

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(EVENT_STREAMING_UPDATE)
  update(
    @MessageBody() updateStreamingDto: UpdateStreamingDto,
    @CurrentPrincipal() principal: Principal,
  ) {
    const streaming = this.streamingService.update({
      updateStreamingDto,
      channelId: principal.username,
    })
    this.server
      .to(streaming.roomId)
      .emit(EVENT_STREAMING_UPDATE, streaming.title)
  }

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(EVENT_STREAMING_END)
  async end(@CurrentPrincipal() principal: Principal) {
    const user = await this.userService.findById(principal.sub)
    const streaming = this.streamingService.end(user.channel.id)
    this.server.to(streaming.roomId).emit(EVENT_STREAMING_END)
  }

  @UseGuards(WsJwtAuthGuard(false))
  @SubscribeMessage(EVENT_STREAMING_JOIN)
  join(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    const streaming = this.streamingService.join(channelId)
    client.join(streaming.roomId)

    const principal = client.request.principal
    if (principal) {
      this.server
        .to(streaming.roomId)
        .emit(EVENT_STREAMING_JOIN, principal.username)
    }
    return streaming
  }

  @UseGuards(WsJwtAuthGuard(false))
  @SubscribeMessage(EVENT_STREAMING_LEAVE)
  leave(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    const streaming = this.streamingService.leave({
      channelId,
      viewerSocketId: client.id,
    })
    client.leave(streaming.roomId)

    const principal = client.request.principal
    if (principal) {
      this.server
        .to(streaming.roomId)
        .emit(EVENT_STREAMING_LEAVE, principal.username)
    }
    return streaming
  }
}

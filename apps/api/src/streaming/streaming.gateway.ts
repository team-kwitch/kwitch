import mediasoup from "mediasoup"
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
} from "@nestjs/websockets"
import { StartStreamingDto } from "./dto/start-streaming.dto"
import { UpdateStreamingDto } from "./dto/update-streaming.dto"
import { Logger, UseGuards, UseInterceptors } from "@nestjs/common"
import { Server, Socket } from "socket.io"
import { type Principal } from "@kwitch/types"
import { WsJwtAuthGuard } from "src/auth/guard/ws-jwt.guard"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"
import { UserService } from "src/user/user.service"
import { WebSocketLoggingInterceptor } from "src/common/interceptor/websocket-logging.interceptor"
import { StreamingService } from "./streaming.service"
import { SOCKET_EVENTS } from "@kwitch/const"
import { JoinStreamingDto } from "./dto/join-streaming.dto"

/**
 * @description
 * - WebSocket Gateway를 사용하여 실시간 스트리밍 기능을 구현합니다.
 * - Socket.IO를 사용하여 클라이언트와 서버 간의 실시간 통신을 처리합니다.
 * - mediasoup 라이브러리를 사용하여 WebRTC 기반의 스트리밍을 지원합니다.
 * - 클라이언트의 연결 및 해제를 처리하고, 스트리밍 시작, 업데이트, 종료 등의 이벤트를 관리합니다.
 */
@WebSocketGateway()
@UseInterceptors(WebSocketLoggingInterceptor)
export class StreamingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(StreamingGateway.name)

  constructor(
    private readonly userService: UserService,
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
          this.streamingService.end({ channelId: principal.username })
          this.server.to(roomId).emit(SOCKET_EVENTS.STREAMING_END)
        } else {
          const channelId = roomId.split("\\")[0]

          if (!channelId) return

          this.streamingService.leave({
            channelId: channelId,
            viewerSocketId: client.id,
          })
          if (principal) {
            this.server
              .to(roomId)
              .emit(SOCKET_EVENTS.STREAMING_LEAVE, principal.username)
          }
        }
      })
    })
  }

  @WebSocketServer()
  private server: Server

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(SOCKET_EVENTS.STREAMING_START)
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
    return streaming.router.rtpCapabilities
  }

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(SOCKET_EVENTS.STREAMING_UPDATE)
  async update(
    @MessageBody() updateStreamingDto: UpdateStreamingDto,
    @ConnectedSocket() client: Socket,
    @CurrentPrincipal() principal: Principal,
  ) {
    const streaming = this.streamingService.update({
      updateStreamingDto,
      channelId: principal.username,
    })
    client.to(streaming.roomId).emit(SOCKET_EVENTS.STREAMING_UPDATE, streaming)
  }

  @UseGuards(WsJwtAuthGuard())
  @SubscribeMessage(SOCKET_EVENTS.STREAMING_END)
  async end(
    @ConnectedSocket() client: Socket,
    @CurrentPrincipal() principal: Principal,
  ) {
    const streaming = this.streamingService.end({
      channelId: principal.username,
    })
    client.to(streaming.roomId).emit(SOCKET_EVENTS.STREAMING_END)
  }

  @UseGuards(WsJwtAuthGuard(false))
  @SubscribeMessage(SOCKET_EVENTS.STREAMING_JOIN)
  join(
    @MessageBody() joinStreamingDto: JoinStreamingDto,
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.join({
      channelId: joinStreamingDto.channelId,
      viewerSocketId: client.id,
    })
    client.join(streaming.roomId)

    const principal = client.request.principal
    if (principal) {
      client
        .to(streaming.roomId)
        .emit(SOCKET_EVENTS.STREAMING_JOIN, principal.username)
    }
    return {
      ...streaming,
      producerIds: Array.from(streaming.sender.producers.keys()),
      rtpCapabilities: streaming.router.rtpCapabilities,
    }
  }

  @UseGuards(WsJwtAuthGuard(false))
  @SubscribeMessage(SOCKET_EVENTS.STREAMING_LEAVE)
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
        .emit(SOCKET_EVENTS.STREAMING_LEAVE, principal.username)
    }
    return streaming
  }

  @SubscribeMessage(SOCKET_EVENTS.MEDIASOUP_CREATE_TRANSPORT)
  async createTransport(
    @MessageBody()
    {
      channelId,
      isSender,
    }: {
      channelId: string
      isSender: boolean
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Is this a producer request? ${isSender}`)

    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const transport = await streaming.router.createWebRtcTransport({
      webRtcServer: streaming.webRtcServer,
    })

    transport.on("icestatechange", (iceState) => {
      if (iceState === "disconnected" || iceState === "closed") {
        this.logger.warn(
          `WebRtcTransport "icestatechange" event [iceState:${iceState}], socket disconnect`,
        )

        client.disconnect()
      }
    })

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "failed" || dtlsState === "closed") {
        this.logger.warn(
          `WebRtcTransport dtlsstatechange event [dtlsState: ${dtlsState}], socket disconnect`,
        )
        client.disconnect()
      }
    })

    if (isSender) {
      streaming.sender.sendTransport = transport
    } else {
      const viewer = streaming.receivers.get(client.id)

      if (!viewer) {
        throw new WsException("Viewer not found.")
      }

      viewer.recvTransport = transport
    }

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.MEDIASOUP_CONNECT_TRANSPORT)
  async connectTransport(
    @MessageBody()
    {
      channelId,
      dtlsParameters,
      isSender,
    }: {
      channelId: string
      dtlsParameters: mediasoup.types.DtlsParameters
      isSender: boolean
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `DTLS parameters: \n${JSON.stringify(dtlsParameters, null, 2)}`,
    )
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    let transport: mediasoup.types.WebRtcTransport | null

    if (!isSender) {
      const viewer = streaming.receivers.get(client.id)
      if (!viewer) {
        throw new WsException("Viewer not found.")
      }
      transport = viewer.recvTransport
    } else {
      transport = streaming.sender.sendTransport
    }

    if (!transport) {
      throw new WsException("Transport not found.")
    }

    await transport.connect({
      dtlsParameters,
    })
  }

  @SubscribeMessage(SOCKET_EVENTS.MEDIASOUP_PRODUCER)
  async createProducer(
    @MessageBody()
    {
      channelId,
      kind,
      rtpParameters,
      appData,
    }: {
      channelId: string
      kind: mediasoup.types.MediaKind
      rtpParameters: mediasoup.types.RtpParameters
      appData: any
    },
  ) {
    const streaming = this.streamingService.findById(channelId)

    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    if (!streaming.sender.sendTransport) {
      throw new WsException("Sender transport not found.")
    }

    const producer = await streaming.sender.sendTransport.produce({
      kind,
      rtpParameters,
      appData,
    })

    producer.on("transportclose", () => {
      this.logger.log("Producer's transport closed")
    })

    streaming.sender.producers.set(producer.id, producer)

    return {
      id: producer.id,
      kind: producer.kind,
      rtpParameters: producer.rtpParameters,
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.MEDIASOUP_CONSUMER)
  async createConsumer(
    @MessageBody()
    {
      channelId,
      producerId,
      rtpCapabilities,
    }: {
      channelId: string
      producerId: string
      rtpCapabilities: mediasoup.types.RtpCapabilities
    },
    @ConnectedSocket() client: Socket,
  ) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const producer = streaming.sender.producers.get(producerId)
    if (!producer) {
      throw new WsException("Producer not found.")
    }

    const viewer = streaming.receivers.get(client.id)
    if (!viewer) {
      throw new WsException("Viewer not found.")
    }
    if (!viewer.recvTransport) {
      throw new WsException("Receiver transport not found.")
    }

    if (
      streaming.router.canConsume({
        producerId,
        rtpCapabilities,
      })
    ) {
      const consumer = await viewer.recvTransport.consume({
        producerId,
        rtpCapabilities,
      })

      viewer.consumers.set(consumer.id, consumer)

      consumer.on("transportclose", () => {
        this.logger.log("Consumer's transport closed")
      })

      return {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        appData: {
          source: producer.appData.source,
        },
      }
    }

    throw new WsException("Cannot consume producer.")
  }

  @SubscribeMessage(SOCKET_EVENTS.MEDIASOUP_CLOSE_PRODUCER)
  async closeProducer(
    @MessageBody()
    { channelId, producerId }: { channelId: string; producerId: string },
  ) {
    const streaming = this.streamingService.findById(channelId)
    if (!streaming) {
      throw new WsException("Streaming not found.")
    }

    const producer = streaming.sender.producers.get(producerId)

    if (!producer) {
      throw new WsException("Producer not found.")
    }

    producer.close()
    streaming.sender.producers.delete(producerId)
  }
}

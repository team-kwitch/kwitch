import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets"
import { StreamingService } from "./interfaces/streaming.service.interface"
import { StartStreamingDto } from "./dto/start-streaming.dto"
import { UpdateStreamingDto } from "./dto/update-streaming.dto"
import { Inject, Logger } from "@nestjs/common"
import {
  EVENT_STREAMING_END,
  EVENT_STREAMING_JOIN,
  EVENT_STREAMING_LEAVE,
  EVENT_STREAMING_START,
  EVENT_STREAMING_UPDATE,
  ISTREAMING_SERVICE,
} from "./constant"
import { Socket } from "socket.io"
import { Streaming } from "@kwitch/domain"

@WebSocketGateway()
export class StreamingGateway {
  private readonly logger = new Logger(StreamingGateway.name)

  constructor(
    @Inject(ISTREAMING_SERVICE)
    private readonly streamingService: StreamingService,
  ) {}

  @SubscribeMessage(EVENT_STREAMING_START)
  async start(
    @MessageBody() startStreamingDto: StartStreamingDto,
    @ConnectedSocket() client: Socket,
  ): Promise<Streaming> {
    const streaming = await this.streamingService.start({
      startStreamingDto,
      channelId: "test",
      socketId: client.id,
    })
    client.join(streaming.roomId)
    this.logger.log(
      `Streaming started: ${streaming.roomId}/${startStreamingDto.title}`,
    )
    return streaming
  }

  @SubscribeMessage(EVENT_STREAMING_UPDATE)
  update(@MessageBody() updateStreamingDto: UpdateStreamingDto): Streaming {
    return this.streamingService.update({
      updateStreamingDto,
    })
  }

  @SubscribeMessage(EVENT_STREAMING_END)
  end(@MessageBody() channelId: string): Streaming {
    return this.streamingService.end({ channelId })
  }

  @SubscribeMessage(EVENT_STREAMING_JOIN)
  join(@MessageBody() channelId: string) {
    return this.streamingService.join({ channelId })
  }

  @SubscribeMessage(EVENT_STREAMING_LEAVE)
  leave(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    return this.streamingService.leave({
      channelId,
      viewerSocketId: client.id,
    })
  }
}

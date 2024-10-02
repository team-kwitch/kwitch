import { Server, Socket } from "socket.io";
import { Service } from "typedi";

import { filterSentence } from "../utils/ChatFilter";
import { StreamingService } from "../services/StreamingService";

import { SocketHandler, socketHandlerToken } from "./SocketHandler";
import assert from "assert";

@Service({ id: socketHandlerToken, multiple: true })
export class StreamingHandler implements SocketHandler {
  private streamingService: StreamingService;

  constructor(streamingService: StreamingService) {
    this.streamingService = streamingService;
  }

  public register(io: Server, socket: Socket) {
    const { user } = socket.request.session;
    const { channel } = user;

    assert(channel, "[socket] [StreamingHandler] channel is essential");

    socket.on("streamings:start", async (title: string, done: Function) => {
      const { rtpCapabilities } = await this.streamingService.startStreaming(
        channel.id,
        title
      );
      socket.join(channel.id);
      console.log(
        `[socket] [streamings:start] streaming started: ${channel.id}/${title}`
      );
      done({ success: true, content: { rtpCapabilities } });
    });

    // socket.on("streamings:end", async (done: Function) => {
    //   try {
    //     const streaming = await channelService.endStreaming(user.id);
    //     io.to(streaming.channelId).emit("streamings:destroy");
    //     socket.leave(streaming.channelId);
    //     console.log(`streaming ended: ${streaming.title}`);
    //     done({ success: true });
    //   } catch (err) {
    //     done({ success: false, message: err.message });
    //   }
    // });

    socket.on("streamings:join", async (channelId: string, done: Function) => {
      try {
        const { streaming, rtpCapabilities } =
          await this.streamingService.joinStreaming(channelId);
        socket.join(channelId);
        io.to(channelId).emit("streamings:joined", user.username);
        console.log(`${user.username} joined ${channelId}/${streaming.title}`);
        done({ success: true, content: { rtpCapabilities } });
      } catch (err: any) {
        done({ success: false, message: err.message });
      }
    });

    // socket.on("streamings:leave", async (channelId: string, done: Function) => {
    //   try {
    //     const streaming = await channelService.leaveStreaming(channelId);
    //     io.to(channelId).emit("streamings:left", user.username);
    //     io.to(channelId).emit("p2p:left", socket.id);
    //     socket.leave(channelId);
    //     console.log(`${user.username} left ${channelId}/${streaming.title}`);
    //     done({ success: true });
    //   } catch (err) {
    //     done({ success: false, message: err.message });
    //   }
    // });

    socket.on(
      "messages:send",
      async (
        channelId: string,
        senderChannelId: string,
        message: string,
        done: Function
      ) => {
        try {
          const filteredMessage = filterSentence(message);

          socket
            .to(channelId)
            .emit(
              "messages:sent",
              user.username,
              filteredMessage,
              channelId === senderChannelId
            );
          console.log(
            `${user.username} sent a message to ${channelId}: ${message}`
          );
          done({ success: true });
        } catch (err: any) {
          done({ success: false, message: err.message });
        }
      }
    );
  }
}

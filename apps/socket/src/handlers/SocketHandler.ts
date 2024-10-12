import { Server, Socket } from "socket.io"

export interface SocketHandler {
  register(io: Server, socket: Socket): void
}

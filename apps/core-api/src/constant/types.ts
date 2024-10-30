import { UserService } from "#services/UserService.js"

const TYPES = {
  AuthService: Symbol.for("AuthService"),
  ChannelService: Symbol.for("ChannelService"),
  StreamingService: Symbol.for("StreamingService"),
  UserService: Symbol.for("UserService"),

  SocketHandler: Symbol.for("SocketHandler"),
}

export { TYPES }

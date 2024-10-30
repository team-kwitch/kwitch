import { Container } from "inversify"

import { TYPES } from "#constant/types.js"
import { AuthService } from "#services/AuthService.js"
import { ChannelService } from "#services/ChannelService.js"
import { StreamingService } from "#services/StreamingService.js"
import { SocketHandler } from "#socket/handlers/SocketHandler.js"
import { SFUConnectionHandler } from "#socket/handlers/SFUConnectionHandler.js"
import { StreamingHandler } from "#socket/handlers/StreamingHandler.js"
import { DisconnectingHandler } from "#socket/handlers/DisconnectionHandler.js"
import { UserService } from "#services/UserService.js"

export const container = new Container()

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope()
container
  .bind<ChannelService>(TYPES.ChannelService)
  .to(ChannelService)
  .inSingletonScope()
container
  .bind<StreamingService>(TYPES.StreamingService)
  .to(StreamingService)
  .inSingletonScope()
container
  .bind<UserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope()

container
  .bind<SocketHandler>(TYPES.SocketHandler)
  .to(SFUConnectionHandler)
  .inSingletonScope()
container
  .bind<SocketHandler>(TYPES.SocketHandler)
  .to(StreamingHandler)
  .inSingletonScope()
container
  .bind<SocketHandler>(TYPES.SocketHandler)
  .to(DisconnectingHandler)
  .inSingletonScope()

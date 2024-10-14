import { Container } from "inversify"

import { TYPES } from "@/constant/types.js"
import { DisconnectingHandler } from "@/handlers/DisconnectionHandler.js"
import { SFUConnectionHandler } from "@/handlers/SFUConnectionHandler.js"
import { SocketHandler } from "@/handlers/SocketHandler.js"
import { StreamingHandler } from "@/handlers/StreamingHandler.js"
import { StreamingService } from "@/services/StreamingService.js"

export const container = new Container()

container
  .bind<StreamingService>(TYPES.StreamingService)
  .to(StreamingService)
  .inSingletonScope()
container
  .bind<SocketHandler>(TYPES.SFUConnectionHandler)
  .to(SFUConnectionHandler)
  .inSingletonScope()
container
  .bind<SocketHandler>(TYPES.StreamingHandler)
  .to(StreamingHandler)
  .inSingletonScope()
container
  .bind<SocketHandler>(TYPES.DisconnectingHandler)
  .to(DisconnectingHandler)
  .inSingletonScope()

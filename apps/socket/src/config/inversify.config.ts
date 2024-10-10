import { Container } from "inversify";

import { TYPES } from "@/constant/types";
import { SFUConnectionHandler } from "@/handlers/SFUConnectionHandler";
import { SocketHandler } from "@/handlers/SocketHandler";
import { StreamingHandler } from "@/handlers/StreamingHandler";
import { StreamingService } from "@/services/StreamingService";

export const container = new Container();

container
  .bind<StreamingService>(TYPES.StreamingService)
  .to(StreamingService)
  .inSingletonScope();
container
  .bind<SocketHandler>(TYPES.SFUConnectionHandler)
  .to(SFUConnectionHandler)
  .inSingletonScope();
container
  .bind<SocketHandler>(TYPES.StreamingHandler)
  .to(StreamingHandler)
  .inSingletonScope();

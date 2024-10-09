import { Container } from "inversify";

import { TYPES } from "@/constant/types";
import { AuthService } from "@/services/AuthService";
import { ChannelService } from "@/services/ChannelService";

export const container = new Container();

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<ChannelService>(TYPES.ChannelService)
  .to(ChannelService)
  .inSingletonScope();

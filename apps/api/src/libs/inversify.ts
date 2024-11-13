import { Container } from "inversify"

import { TYPES } from "#/constant/types.js"
import { AuthService } from "#/services/auth.service.js"
import { ChannelService } from "#/services/channel.service.js"

export const container = new Container()

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope()
container
  .bind<ChannelService>(TYPES.ChannelService)
  .to(ChannelService)
  .inSingletonScope()

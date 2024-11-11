import {
  controller,
  httpGet,
  interfaces,
  response,
} from "inversify-express-utils"
import { Response } from "express"

import { CustomResponse } from "@kwitch/domain"
import { getStreamings } from "#/socket/services/streaming.service.js"

@controller("/streamings")
export class LiveChannelController implements interfaces.Controller {
  @httpGet("/")
  public async getLiveChannels(@response() res: Response<CustomResponse>) {
    const streamings = getStreamings()
    return res.json({
      success: true,
      content: { streamings },
    })
  }
}

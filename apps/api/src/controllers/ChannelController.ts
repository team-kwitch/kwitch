import * as express from "express"
import { inject } from "inversify"
import {
  controller,
  httpGet,
  requestParam,
  response,
} from "inversify-express-utils"

import { CustomResponse } from "@kwitch/types"

import { TYPES } from "@/constant/types"
import { ChannelService } from "@/services/ChannelService"

@controller("/channels")
export class ChannelController {
  private channelService: ChannelService

  constructor(@inject(TYPES.ChannelService) channelService: ChannelService) {
    this.channelService = channelService
  }

  @httpGet("/:channelId")
  public async getChannel(
    @response() res: express.Response<CustomResponse>,
    @requestParam("channelId") channelId: string,
  ) {
    const channel = this.channelService.getChannelById(channelId)
    return res.json({
      success: true,
      content: { channel },
    })
  }
}

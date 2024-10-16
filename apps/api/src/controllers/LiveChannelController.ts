import express from "express"
import { inject } from "inversify"
import {
  controller,
  httpGet,
  interfaces,
  response,
} from "inversify-express-utils"

import { CustomResponse } from "@kwitch/domain"

import { TYPES } from "@/constant/types.js"
import { ChannelService } from "@/services/ChannelService.js"

@controller("/live-channels")
export class LiveChannelController implements interfaces.Controller {
  private readonly channelService: ChannelService

  constructor(@inject(TYPES.ChannelService) channelService: ChannelService) {
    this.channelService = channelService
  }

  @httpGet("/")
  public async getLiveChannels(
    @response() res: express.Response<CustomResponse>,
  ) {
    const liveChannels = await this.channelService.getLiveChannels()
    return res.json({
      success: true,
      content: { liveChannels },
    })
  }
}

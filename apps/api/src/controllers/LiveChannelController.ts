import express from "express";
import { inject } from "inversify";
import { controller, httpGet, interfaces, response } from "inversify-express-utils";

import { CustomResponse } from "@kwitch/types";

import { TYPES } from "@/constant/types";
import { ChannelService } from "@/services/ChannelService";

@controller("/live-channels")
export class LiveChannelController implements interfaces.Controller {
  private readonly channelService: ChannelService;

  constructor(@inject(TYPES.ChannelService) channelService: ChannelService) {
    this.channelService = channelService;
  }

  @httpGet("/")
  public async getLiveChannels(
    @response() res: express.Response<CustomResponse>,
  ) {
    const liveChannels = await this.channelService.getLiveChannels();
    return res.json({
      success: true,
      content: { liveChannels },
    });
  }
}

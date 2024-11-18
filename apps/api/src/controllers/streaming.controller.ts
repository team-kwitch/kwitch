import {
  BaseHttpController,
  controller,
  httpGet,
  params,
  requestParam,
  response,
} from "inversify-express-utils"
import * as express from "express"

import { CustomResponse } from "@kwitch/domain"
import {
  getStreaming,
  getStreamings,
} from "#/socket/services/streaming.service.js"

@controller("/streamings")
export class LiveChannelController extends BaseHttpController {
  @httpGet("/")
  public async getLiveChannels(
    @response() res: express.Response<CustomResponse>,
  ) {
    const streamings = getStreamings()
    return res.json({
      success: true,
      content: {
        streamings: streamings.map((streaming) => {
          return {
            title: streaming.title,
            roomId: streaming.roomId,
            streamer: streaming.streamer,
            viewerCount: streaming.viewerCount,
          }
        }),
      },
    })
  }

  @httpGet("/:channelId")
  public async getLiveChannel(
    @response() res: express.Response<CustomResponse>,
    @requestParam("channelId") channelId: string,
  ) {
    const streaming = getStreaming(channelId)
    return res.json({
      success: true,
      content: {
        streaming: {
          title: streaming.title,
          roomId: streaming.roomId,
          streamer: streaming.streamer,
          viewerCount: streaming.viewerCount,
        },
      },
    })
  }
}

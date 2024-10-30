import assert from "assert"
import * as express from "express"
import {
  BaseHttpController,
  controller,
  httpGet,
  request,
  response,
} from "inversify-express-utils"

import { CustomResponse } from "@kwitch/domain"

import { isAuthenticatedMiddleware } from "#middlewares/AuthenticationMiddleware.js"

@controller("/users")
export class UserController extends BaseHttpController {
  @httpGet("/me", isAuthenticatedMiddleware)
  public me(
    @request() req: express.Request,
    @response() res: express.Response<CustomResponse>,
  ) {
    assert(req.user, "req.user is undefined")
    const user = req.user
    const { password: _, ...userWithoutPassword } = user
    return res.json({
      success: true,
      content: {
        user: userWithoutPassword,
      },
    })
  }
}

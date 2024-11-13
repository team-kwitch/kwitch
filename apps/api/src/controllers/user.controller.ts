import assert from "assert"
import * as express from "express"
import {
  BaseHttpController,
  controller,
  httpGet,
  request,
  response,
} from "inversify-express-utils"

import { CustomResponse, User } from "@kwitch/domain"

import { isAuthenticated } from "#/middlewares/auth.middleware.js"

@controller("/users")
export class UserController extends BaseHttpController {
  @httpGet("/me", isAuthenticated)
  public me(
    @request() req: express.Request,
    @response() res: express.Response<CustomResponse>,
  ) {
    const user = req.user as User
    const { password: _, ...userWithoutPassword } = user
    return res.json({
      success: true,
      content: {
        user: userWithoutPassword,
      },
    })
  }
}

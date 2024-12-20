import * as express from "express"
import { inject } from "inversify"
import {
  BaseHttpController,
  controller,
  httpPost,
  interfaces,
  request,
  response,
} from "inversify-express-utils"

import { CustomResponse, User } from "@kwitch/domain"

import { authenticate } from "#/middlewares/auth.middleware.js"
import { TYPES } from "#/constant/types.js"
import { AuthService } from "#/services/auth.service.js"

@controller("/auth")
export class AuthController extends BaseHttpController {
  private readonly authService: AuthService

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
    super()
    this.authService = authService
  }

  @httpPost("/sign-up")
  public async signUp(
    @request() req: express.Request,
    @response() res: express.Response<CustomResponse>,
  ) {
    const { username, password }: { username: string; password: string } =
      req.body
    const createdUser = await this.authService.signUp(username, password)
    return res.json({
      success: true,
    })
  }

  @httpPost("/sign-in/local", authenticate)
  public localSignIn(
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

  @httpPost("/sign-out")
  public async signOut(
    @request() req: express.Request,
    @response() res: express.Response<CustomResponse>,
  ) {
    return new Promise((resolve, reject) =>
      req.logOut((err) => {
        if (err) {
          return reject(err)
        }
        return res.json({ success: true })
      }),
    )
  }
}

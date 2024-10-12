import * as express from "express"
import { inject } from "inversify"
import {
  controller,
  httpPost,
  interfaces,
  request,
  response,
} from "inversify-express-utils"

import { passport } from "@kwitch/auth"
import { CustomResponse, User } from "@kwitch/types"

import { TYPES } from "@/constant/types"
import { AuthService } from "@/services/AuthService"

@controller("/auth")
export class AuthController implements interfaces.Controller {
  private readonly authService: AuthService

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
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
    console.log(createdUser)
    return res.json({
      success: true,
    })
  }

  @httpPost("/sign-in/local", passport.authenticate("local"))
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

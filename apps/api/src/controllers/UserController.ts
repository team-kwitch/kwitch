import * as express from "express";
import {
  BaseHttpController,
  controller,
  httpGet,
  request,
  response,
} from "inversify-express-utils";

import { isAuthenticated } from "@/middlewares/AuthenticationMiddleware";
import assert from "assert";

@controller("/users")
export class UserController extends BaseHttpController {
  @httpGet("/me", isAuthenticated)
  public me(
    @request() req: express.Request,
    @response() res: express.Response,
  ) {
    assert(req.user, "req.user is undefined");
    const user = req.user;
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      content: {
        user: userWithoutPassword,
      },
    });
  }
}

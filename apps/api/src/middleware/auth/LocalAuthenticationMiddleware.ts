import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, UnauthorizedError } from "routing-controllers";

import { passport } from "@kwitch/auth";

export class LocalAuthenticationMiddleware implements ExpressMiddlewareInterface {

  private authenticate(cb: passport.AuthenticateCallback): any {
    passport.authenticate("local", { session: true }, cb);
  }

  use(req: Request, res: Response, next: NextFunction): Promise<passport.Authenticator> {
    return this.authenticate((authErr, user, info) => {
      if (authErr || !user) {
        console.log("unauthrozed access", info);
        return next(new UnauthorizedError());
      }

      return next();
    })(req, res, next);
  }
}

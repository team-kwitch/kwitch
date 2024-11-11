import * as express from "express"

import { passport } from "#/libs/passport/index.js"

export const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => passport.authenticate("local")(req, res, next)

export const isAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    })
    return
  }

  next()
}

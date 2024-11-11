import { type Request, type Response, type NextFunction } from "express"

import { passport } from "#/libs/passport/index.js"

export const authenticate = (req: Request, res: Response, next: NextFunction) =>
  passport.authenticate("local")(req, res, next)

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
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

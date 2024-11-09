import express from "express"
import { passport } from "#lib/passport.js"

export const authenticate = passport.authenticate("local")

export const isAuthenticatedMiddleware = (
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

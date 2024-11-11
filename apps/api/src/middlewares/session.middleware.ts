import session from "express-session"
import RedisStore from "connect-redis"

import { redis } from "@kwitch/database/redis"
import { SESSION_SECRET_KEY } from "#/libs/env.js"
import { passport } from "#/libs/passport/index.js"

const sessionOptions: session.SessionOptions = {
  store: new RedisStore({
    client: redis,
    prefix: "session:",
  }),
  secret: SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

function onlyForHandshake(middleware: any) {
  return (req: any, res: any, next: any) => {
    const isHandshake = req._query.sid === undefined
    if (isHandshake) {
      middleware(req, res, next)
    } else {
      next()
    }
  }
}

export const sessionMiddlewares = [
  session(sessionOptions),
  passport.initialize(),
  passport.session(),
]

export const ioSessionMiddlewares = [
  onlyForHandshake(sessionMiddlewares[0]),
  onlyForHandshake(sessionMiddlewares[2]),
  onlyForHandshake((req: any, res: any, next: any) => {
    if (req.user) {
      console.log("socket recognized user: ", req.user)
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  })
]

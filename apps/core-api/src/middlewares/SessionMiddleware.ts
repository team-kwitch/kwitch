import session from "express-session"
import RedisStore from "connect-redis"
import passport from "passport"

import { redis } from "@kwitch/persistence/redis"

const sessionOptions: session.SessionOptions = {
  store: new RedisStore({
    client: redis,
    prefix: "session:",
  }),
  secret: "asdklfjaksldfjlk",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

export const sessionMiddlewares = [
  session(sessionOptions),
  passport.initialize(),
  passport.session(),
]

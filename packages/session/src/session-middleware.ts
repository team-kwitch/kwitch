import session from "express-session"
import RedisStore from "connect-redis"

import { redis } from "@kwitch/db-connection/redis"

import { passport } from "./passport.js"
import { SECRET_KEY } from "./config.js"

const sessionOptions: session.SessionOptions = {
  store: new RedisStore({
    client: redis,
    prefix: "session:",
  }),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

export const sessionMiddlewares = [session(sessionOptions), passport.initialize(), passport.session()]

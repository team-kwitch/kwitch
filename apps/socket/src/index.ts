// sort-imports-ignore
import "reflect-metadata"
import RedisStore from "connect-redis"
import session from "express-session"
import helmet from "helmet"
import { Server, Socket } from "socket.io"
import express, { Request } from "express"
import { createServer } from "node:http"

import { redisClient } from "@kwitch/db"

import { SECRET_KEY } from "@/config/env.js"

import { createWorker } from "./models/Worker.js"
import { passport } from "@kwitch/auth"
import { container } from "./config/inversify.config.js"
import { SocketHandler } from "./handlers/SocketHandler.js"
import { TYPES } from "./constant/types.js"
import { assert } from "node:console"

const app = express();
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ["https://kwitch.online"],
  },
})

io.engine.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
    }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }),
)
io.engine.use(passport.initialize())
io.engine.use(passport.session())
io.engine.use(helmet())

io.use((socket: Socket, next) => {
  const { user } = socket.request as Request
  if (user) {
    console.log("[socket] user connected:", user.username)
    return next()
  } else {
    console.error("[socket] unauthorized user connected")
    return next(new Error("unauthorized"))
  }
})

const streamingHandler = container.get<SocketHandler>(TYPES.StreamingHandler)
const sfuConnectionHandler = container.get<SocketHandler>(
  TYPES.SFUConnectionHandler,
)
const disconnectingHandler = container.get<SocketHandler>(
  TYPES.DisconnectingHandler,
)
io.on("connection", (socket: Socket) => {
  streamingHandler.register(io, socket)
  sfuConnectionHandler.register(io, socket)
  disconnectingHandler.register(io, socket)
})

httpServer.listen(8001, async () => {
  await createWorker()
  console.log("[socket] server is running on port 8001")
})

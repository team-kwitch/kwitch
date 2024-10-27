// sort-imports-ignore
import "reflect-metadata"
import helmet from "helmet"
import { Server, Socket } from "socket.io"
import express, { Request } from "express"
import { createServer } from "node:http"

import { container } from "./config/inversify.config.js"
import { SocketHandler } from "./handlers/SocketHandler.js"
import { TYPES } from "./constant/types.js"
import { sessionMiddlewares } from "@kwitch/session/middleware"
import { dataSource } from "node_modules/@kwitch/db-connection/src/data-source.js"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://kwitch.online"
        : "http://localhost:3000",
  },
})

sessionMiddlewares.forEach((middleware) => io.engine.use(middleware))
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
  await dataSource.initialize()
  console.log("[socket] server is running on port 8001")
})

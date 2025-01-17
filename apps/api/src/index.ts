// sort-imports-ignore
import "reflect-metadata"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import { InversifyExpressServer } from "inversify-express-utils"
import morgan from "morgan"
import { NextFunction, Request, Response } from "express"

import { dataSource } from "@kwitch/database"

import {
  ioSessionMiddlewares,
  sessionMiddlewares,
} from "#/middlewares/session.middleware.js"
import { container } from "#/libs/inversify.js"
import "#/controllers/auth.controller.js"
import "#/controllers/channel.controller.js"
import "#/controllers/user.controller.js"
import "#/controllers/streaming.controller.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { registerStreamingHandler } from "./socket/handlers/streaming.handler.js"
import { registerSfuConnectionHandler } from "./socket/handlers/sfu-connection.handler.js"
import { registerDisconnectionHandler } from "./socket/handlers/disconnection.handler.js"
import { redis } from "@kwitch/database/redis"
import { initWorkers } from "./socket/services/worker.service.js"
import { AppError } from "./error/app.error.js"
import { CustomResponse } from "@kwitch/domain"

const corsOption: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://kwitch.online"
      : "http://localhost:3000",
  credentials: true,
}

const server = new InversifyExpressServer(container, null, { rootPath: "/api" })

server.setConfig((server) => {
  server.use(helmet())
  server.use(cors(corsOption))
  server.use(sessionMiddlewares)
  server.use(bodyParser.urlencoded({ extended: false }))
  server.use(bodyParser.json())
  server.use(morgan("tiny"))
  if (process.env.NODE_ENV === "production") {
    server.set("trust proxy", 1)
  }
})

const app = server.build()

app.use(
  (
    err: Error,
    req: Request,
    res: Response<CustomResponse>,
    next: NextFunction,
  ) => {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .send({ success: false, error: err.message })
    }
    res.status(500).send({ success: false, error: "Internal Server Error" })
  },
)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: corsOption,
})

ioSessionMiddlewares.forEach((middleware) => {
  io.engine.use(middleware)
})

io.on("connection", (socket) => {
  registerStreamingHandler(io, socket)
  registerSfuConnectionHandler(io, socket)
  registerDisconnectionHandler(io, socket)
})

httpServer.listen(8000, async () => {
  await dataSource.initialize()
  await redis.connect()
  await initWorkers()
  console.log("Server is running on port 8000")
})

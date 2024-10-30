// sort-imports-ignore
import "reflect-metadata"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import { InversifyExpressServer } from "inversify-express-utils"
import { createServer } from "node:http"
import { Server } from "socket.io"

import { sessionMiddlewares } from "#middlewares/SessionMiddleware.js"
import { TYPES } from "#constant/types.js"
import { container } from "#config/inversify.js"
import "#controllers/AuthController.js"
import "#controllers/ChannelController.js"
import "#controllers/UserController.js"
import "#controllers/LiveChannelController.js"
import { SocketHandler } from "#socket/handlers/SocketHandler.js"

const corsOption: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://kwitch.online"
      : "http://localhost:3000",
  credentials: true,
}

const server = new InversifyExpressServer(container, null, {
  rootPath: "/api"
});
server.setConfig((app) => {
  app.use(cors(corsOption))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(sessionMiddlewares)
  app.use(helmet())
})

const app = server.build()
const httpServer = createServer(app)
const io = new Server(httpServer)

sessionMiddlewares.forEach((middleware) => io.engine.use(middleware))

const handlers = container.getAll<SocketHandler>(TYPES.SocketHandler)
io.on("connection", (socket) => {
  handlers.forEach((handler) => handler.register(io, socket))
})

httpServer.listen(8000, async () => {
  console.log("[core-api] server is running on port 8000")
})
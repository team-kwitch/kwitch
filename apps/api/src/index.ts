// sort-imports-ignore
import "reflect-metadata"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import express from "express"
import { InversifyExpressServer } from "inversify-express-utils"

import { sessionMiddlewares } from "@kwitch/session/middleware"

import { container } from "@/config/inversify.config.js"
import "@/controllers/AuthController.js"
import "@/controllers/ChannelController.js"
import "@/controllers/UserController.js"
import "@/controllers/LiveChannelController.js"

const corsOption: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://kwitch.online"
      : "http://localhost:3000",
  credentials: true,
}

const app = express()
app.use(cors(corsOption))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(sessionMiddlewares)
app.use(helmet())

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

const server = new InversifyExpressServer(
  container,
  null,
  {
    rootPath: "/api",
  },
  app,
)

server.build().listen(8000, () => {
  console.log("[api] server is running on port 8000")
})

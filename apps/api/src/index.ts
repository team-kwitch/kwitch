// sort-imports-ignore
import "reflect-metadata";
import bodyParser from "body-parser";
import RedisStore from "connect-redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import express from "express";
import { InversifyExpressServer } from "inversify-express-utils";

import { passport } from "@kwitch/auth";
import { redisClient } from "@kwitch/db";

import { SECRET_KEY } from "@/config/env";
import "@/controllers/AuthController";
import "@/controllers/ChannelController";
import "@/controllers/UserController";
import { container } from "@/config/inversify.config";

const corsOption: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://kwitch.online"
      : "http://localhost:3000",
  credentials: true,
};

const sessionOptions: session.SessionOptions = {
  store: new RedisStore({
    client: redisClient,
    prefix: "session:",
  }),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
};

const app = express();
app.use(cors(corsOption));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const server = new InversifyExpressServer(
  container,
  null,
  {
    rootPath: "/api",
  },
  app,
);

server.build().listen(8000, () => {
  console.log("[api] server is running on port 8000");
});

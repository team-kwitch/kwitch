import bodyParser from "body-parser";
import RedisStore from "connect-redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Request } from "express";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import "reflect-metadata";
import { useContainer, useExpressServer } from "routing-controllers";
import { Container } from "typedi";

import { passport } from "@kwitch/auth";
import { redisClient } from "@kwitch/db";

import { SECRET_KEY } from "@/config/index";

useContainer(Container);

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const corsOption: cors.CorsOptions = {
  origin: ["https://kwitch.online", "http://localhost:3000"],
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
};

app.use(helmet());
app.use(cors(corsOption));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

const __dirname = path.resolve();
useExpressServer(app, {
  routePrefix: "/api",
  controllers: [
    __dirname + "/controllers/*.ts",
    __dirname + "/controllers/*.js",
  ],
  authorizationChecker: async (action, roles) => {
    const request = action.request as Request;
    return request.isAuthenticated();
  },
  currentUserChecker: async (action) => {
    const request = action.request as Request;
    return request.user;
  },
});

app.listen(8000, () => {
  console.log("[api] server is running on port 8000");
});

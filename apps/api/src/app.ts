import { prisma } from "@kwitch/db";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Request } from "express";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import passport from "passport";
import "reflect-metadata";
import { useContainer, useExpressServer } from "routing-controllers";
import Container from "typedi";

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
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};

app.use(helmet());
app.use(cors(corsOption));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

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
  console.log("Server is running on port 8000");
});

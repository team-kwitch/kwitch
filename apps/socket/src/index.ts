import { Server, Socket } from "socket.io";
import RedisStore from "connect-redis";
import helmet from "helmet";
import session from "express-session";
import Container from "typedi";

import { redisClient } from "@kwitch/db";

import { SECRET_KEY } from "@/config";

import { StreamingHandler } from "./handlers/StreamingHandler";
import { SFUConnectionHandler } from "./handlers/SFUConnectionHandler";
import { socketHandlerToken } from "./handlers/SocketHandler";

const io = new Server({
  cors: {
    origin: ["https://kwitch.online"],
  },
});

io.engine.use(helmet());
io.engine.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
    }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

io.use((socket: Socket, next) => {
  const { user } = socket.request.session;
  if (user) {
    console.log("[socket] user connected:", user.username);
    return next();
  } else {
    console.error("[socket] unauthorized user connected");
    return next(new Error("unauthorized"));
  }
});

Container.import([StreamingHandler, SFUConnectionHandler]);
io.on("connection", (socket: Socket) => {
  Container.getMany(socketHandlerToken).forEach((handler) => {
    handler.register(io, socket);
  });
});

io.listen(8001);

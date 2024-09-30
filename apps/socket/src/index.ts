import { Server, Socket } from "socket.io";

import helmet from "helmet";
import session from "express-session";
import Container from "typedi";

import { SECRET_KEY } from "@/config";

import { StreamingHandler } from "./handlers/StreamingHandler";
import { SFUConnectionHandler } from "./handlers/SFUConnectionHandler";
import { socketHandlerToken } from "./handlers/SocketHandler";

const io = new Server({
  path: "/socket",
  cors: {
    origin: ["https://kwitch.online"],
  },
});

io.engine.use(helmet());
io.engine.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
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

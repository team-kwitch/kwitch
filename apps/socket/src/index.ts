import { Server } from "socket.io";

import helmet from "helmet";
import session from "express-session";

import { authenticate } from "@kwitch/auth";
import { SESSION_SECRET } from "config";

const io = new Server({
  path: "/socket",
  cors: {
    origin: ["https://kwitch.online"],
  },
});

io.engine.use(helmet());
io.engine.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

io.engine.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

io.on("connection", (socket) => {
  const { user } = socket.request.session;
});

io.listen(8001);

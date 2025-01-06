import { User as KwitchUser } from "@kwitch/domain"
import { Socket } from "socket.io";

declare global {
  namespace Express {
    interface User extends KwitchUser {}
  }
}
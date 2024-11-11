import { User as KwitchUser } from "@kwitch/domain"

declare global {
  namespace Express {
    interface User extends KwitchUser {}
  }
}
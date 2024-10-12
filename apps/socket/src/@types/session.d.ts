import { User } from "@kwitch/types"

declare module "http" {
  interface IncomingMessage {
    user: User
  }
}

import { Principal } from "@kwitch/types"
import { IncomingMessage } from "http"

declare module "http" {
  interface IncomingMessage {
    principal?: Principal
  }
}

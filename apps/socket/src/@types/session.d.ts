import { User } from "@kwitch/types";
import { SessionData } from "express-session";

declare module "http" {
    interface IncomingMessage {
        session: SessionData & {
            user: User
        }
    }
}
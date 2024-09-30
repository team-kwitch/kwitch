import { User, Channel } from "@kwitch/types";
import { SessionData } from "express-session";

declare module "http" {
    interface IncomingMessage {
        session: SessionData & {
            user: {
                channel?: Channel;
            } & User;
        }
    }
}
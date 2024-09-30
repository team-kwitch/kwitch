import { User, Channel } from "@kwitch/types";

declare module express {
    interface Request {
        user: User & Channel;
    }
}
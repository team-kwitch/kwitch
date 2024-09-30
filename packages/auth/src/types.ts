import { User, Channel } from "@kwitch/types";

declare namespace express {
    interface Request {
        user: User & Channel;
    }
}
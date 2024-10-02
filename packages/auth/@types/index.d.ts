import { User as IUser } from "@kwitch/types";

declare global {
    namespace Express {
        export interface User extends IUser {}
    }
}
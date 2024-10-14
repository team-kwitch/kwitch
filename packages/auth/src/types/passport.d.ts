import { User as UserModel } from "@kwitch/types";

declare global {
    namespace Express {
        interface User extends UserModel {}
    }
}
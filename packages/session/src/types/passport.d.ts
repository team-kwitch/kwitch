import { User as UserModel } from "@kwitch/domain";

declare global {
    namespace Express {
        interface User extends UserModel {}
    }
}
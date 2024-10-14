import { User as IUser } from "@kwitch/types"

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

import { User as IUser } from "@kwitch/domain"

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

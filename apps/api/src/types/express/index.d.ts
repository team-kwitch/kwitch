import { User } from "@kwitch/types"

declare module "express" {
  interface Request {
    user: User;
  }
}

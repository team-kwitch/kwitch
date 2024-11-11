import bcrypt from "bcrypt"
import { Strategy as LocalStrategy } from "passport-local"

import { UserRepository } from "@kwitch/database/repository"

export const localStrategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password", session: true },
  async (username: string, password: string, cb) => {
    try {
      const findUser = await UserRepository.findOne({
        where: {
          username,
        },
        relations: ["channel"],
      })
      if (!findUser) {
        return cb(null, false, { message: "User does not exist." })
      }

      const checkPassword = await bcrypt.compare(password, findUser.password)
      if (!checkPassword) {
        return cb(null, false, { message: "Password does not match." })
      }

      return cb(null, findUser)
    } catch (err) {
      return cb(err)
    }
  },
)

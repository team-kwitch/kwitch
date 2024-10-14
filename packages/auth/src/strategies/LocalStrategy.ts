import bcrypt from "bcrypt"
import { Strategy as LocalStrategy } from "passport-local"

import { prismaClient } from "@kwitch/db"
import { User } from "@kwitch/types"

export const localStrategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password", session: true },
  async (username: string, password: string, cb) => {
    try {
      const findUser = await prismaClient.user.findUnique({
        where: { username },
        include: { channel: true },
      })

      if (!findUser) {
        return cb(null, false, { message: "User does not exist." })
      }

      const checkPassword = await bcrypt.compare(password, findUser.password)

      if (!checkPassword) {
        return cb(null, false, { message: "Password does not match." })
      }

      return cb(null, findUser as User)
    } catch (err) {
      return cb(err)
    }
  },
)

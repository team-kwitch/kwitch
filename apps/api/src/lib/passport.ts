import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcrypt"
import passport from "passport"

import { User } from "@kwitch/domain"

import { UserService } from "#services/UserService.js"
import { TYPES } from "#constant/types.js"

import { container } from "./inversify.js"

const userService = container.get<UserService>(TYPES.UserService)

const localStrategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password", session: true },
  async (username: string, password: string, cb) => {
    try {
      const findUser = await userService.fetchUserByUsername(username)
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

passport.use(localStrategy)

passport.serializeUser((user: Omit<User, "password">, cb) => {
  cb(null, user.username)
})

passport.deserializeUser(async (username: string, cb) => {
  try {
    const findUser = await userService.fetchUserByUsername(username)
    cb(null, findUser)
  } catch (err) {
    cb(err)
  }
})

export { passport }

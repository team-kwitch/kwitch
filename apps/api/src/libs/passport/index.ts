import passport from "passport"

import { UserRepository } from "@kwitch/database/repository"

import { localStrategy } from "./strategies/local-strategy.js"

passport.use(localStrategy)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (userId: number, cb) => {
  try {
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ["channel"],
    })
    return cb(null, user)
  } catch (err) {
    return cb(err)
  }
})

export { passport }

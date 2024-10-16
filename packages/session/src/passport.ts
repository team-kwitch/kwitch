import passport from "passport"

import { User } from "@kwitch/domain"

import { localStrategy } from "./strategies/LocalStrategy.js"
import { getUserWithChannelById } from "./get-user.js"

passport.use(localStrategy)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (userId: number, cb) => {
  try {
    const user = await getUserWithChannelById(userId)
    return cb(null, user as User)
  } catch (err) {
    return cb(err)
  }
})

export { passport }

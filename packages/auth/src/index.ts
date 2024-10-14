import passport from "passport"

import { prismaClient } from "@kwitch/db"

import { localStrategy } from "./strategies/LocalStrategy.js"
import { User } from "@kwitch/types"

passport.use(localStrategy)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (userId: number, cb) => {
  try {
    const user = await prismaClient.user.findUniqueOrThrow({
      where: { id: userId },
      include: { channel: true },
    })

    return cb(null, user as User)
  } catch (err) {
    return cb(err)
  }
})

export { passport }

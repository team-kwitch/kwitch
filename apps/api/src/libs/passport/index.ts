import passport from "passport"

import { localStrategy } from "./strategies/local-strategy.js"
import { UserRepository } from "@kwitch/database/repository"

passport.use(localStrategy)

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user.id)
  })
})

passport.deserializeUser((userId: number, cb) => {
  process.nextTick(async () => {
    try {
      const user = await UserRepository.findOneOrFail({
        where: { id: userId },
        relations: ["channel"],
      })
      return cb(null, user)
    } catch (err: any) {
      return cb(err)
    }
  })
})

export { passport }

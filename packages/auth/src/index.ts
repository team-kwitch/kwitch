import passport from "passport";

import { prisma } from "@kwitch/db";

import { localStrategy } from "./strategies/LocalStrategy";

passport.use(localStrategy);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (userId: number, cb) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { channel: true },
    });

    if (!user) {
      cb(new Error("User not found"));
      return;
    }

    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
});

export { passport };

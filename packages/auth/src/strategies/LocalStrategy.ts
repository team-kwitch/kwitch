import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";

import { prisma } from "@kwitch/db";

export const localStrategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password", session: true },
  async (username: string, password: string, cb) => {
    try {
      const findUser = await prisma.user.findUnique({
        where: { username },
        include: { channel: true },
      });

      if (!findUser) {
        return cb(null, false, { message: "User does not exist." });
      }

      const checkPassword = await bcrypt.compare(password, findUser.password);

      if (!checkPassword) {
        return cb(null, false, { message: "Password does not match." });
      }

      return cb(null, findUser);
    } catch (err) {
      return cb(err);
    }
  }
);

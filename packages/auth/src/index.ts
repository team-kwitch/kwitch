import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

import prisma from "@kwitch/db";
import type { User } from "@kwitch/types";

const localStrategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password", session: true },
  async (username: string, password: string, cb) => {
    try {
      const findUser = await prisma.user.findUnique({
        where: { username },
        include: { channel: true },
      });

      if (!findUser) {
        throw new Error("존재하지 않는 사용자입니다.");
      }

      const checkPassword = await bcrypt.compare(password, findUser.password);

      if (!checkPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      return cb(null, findUser);
    } catch (err) {
      cb(err);
    }
  }
);

passport.use(localStrategy);

passport.serializeUser((user: User, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((userId: number, cb) => {
  prisma.user
    .findUnique({
      where: { id: userId },
      include: { channel: true },
    })
    .then((user) => {
      cb(null, user);
    })
    .catch((err) => {
      cb(err);
    });
});

export const authenticate = passport.authenticate("local", { session: true });

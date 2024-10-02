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
  },
);

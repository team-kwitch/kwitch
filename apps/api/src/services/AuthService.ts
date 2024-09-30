import bcrypt from "bcrypt";
import { Service } from "typedi";

import { prisma } from "@kwitch/db";

@Service()
export default class AuthService {
  async signUp(username: string, password: string) {
    const checkUser = await prisma.user.findUnique({ where: { username } });
    if (checkUser) {
      throw new Error("username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        channel: {
          create: {
            name: username,
          },
        },
      },
    });
    delete createdUser.password;

    return createdUser;
  }
}

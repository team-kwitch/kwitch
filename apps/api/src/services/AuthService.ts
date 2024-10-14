import bcrypt from "bcrypt"
import { injectable } from "inversify"

import { prismaClient } from "@kwitch/db"

@injectable()
export class AuthService {
  public async signUp(username: string, password: string) {
    const checkUser = await prismaClient.user.findUnique({ where: { username } })
    if (checkUser) {
      throw new Error("username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const createdUser = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        channel: {
          create: {
            name: username,
          },
        },
      },
      include: { channel: true },
    })

    return createdUser
  }
}

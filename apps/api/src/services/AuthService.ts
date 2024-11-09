import bcrypt from "bcrypt"
import { injectable } from "inversify"

import { prisma } from "#lib/prisma.js"

@injectable()
export class AuthService {
  private readonly userRepository = prisma.user

  public async signUp(username: string, password: string) {
    const isExistsUser = await this.userRepository.count({
      where: {
        username,
      },
    })
    if (isExistsUser) {
      throw new Error("username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const createdUser = await this.userRepository.create({
      data: {
        username,
        password: hashedPassword,
        channel: {
          create: {
            name: `${username}'s channel`,
          },
        },
      },
      include: {
        channel: true,
      },
    })
    const { password: _, ...userWithoutPassword } = createdUser
    return userWithoutPassword
  }
}

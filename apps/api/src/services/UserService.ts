import { injectable } from "inversify"

import { User } from "@kwitch/domain"

import { prisma } from "#lib/prisma.js"

@injectable()
export class UserService {
  private readonly userRepository = prisma.user

  async fetchUserByUsername(username: string): Promise<User> {
    const findUser = await this.userRepository.findFirstOrThrow({
      where: {
        username,
      },
      include: {
        channel: true,
      },
    })

    if (findUser.channel === null) {
      throw new Error("Channel does not exist.")
    }

    return {
      ...findUser,
      channel: findUser.channel,
    }
  }
}

import { injectable } from "inversify"

import { prismaClient } from "@kwitch/db-core"
import { User } from "@kwitch/domain"

@injectable()
export class UserService {
  private readonly userRepository = prismaClient.user

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

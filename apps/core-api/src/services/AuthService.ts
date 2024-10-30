import bcrypt from "bcrypt"
import { injectable } from "inversify"

import {
  ChannelRepository,
  UserRepository,
} from "@kwitch/persistence/repository"

@injectable()
export class AuthService {
  public async signUp(username: string, password: string) {
    const isExistsUser = await UserRepository.createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getExists()
    if (isExistsUser) {
      throw new Error("username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const createdChannel = ChannelRepository.create({
      name: `${username}'s channel`,
    })
    const createdUser = UserRepository.create({
      username: username,
      password: hashedPassword,
      channel: createdChannel,
    })
    await UserRepository.save(createdUser)
    return createdUser
  }
}

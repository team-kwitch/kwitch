import bcrypt from "bcrypt"
import { injectable } from "inversify"

import { ChannelRepository, UserRepository } from "@kwitch/database/repository"
import { AppError } from "#/error/app.error.js"

@injectable()
export class AuthService {
  public async signUp(username: string, password: string) {
    const isExistsUser = await UserRepository.findOneBy({
      username,
    })
    if (isExistsUser) {
      throw new AppError({
        statusCode: 400,
        message: "username already exists",
      })
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

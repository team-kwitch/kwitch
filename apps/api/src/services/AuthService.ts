import bcrypt from "bcrypt"
import { injectable } from "inversify"

import { UserRepository } from "@kwitch/db-connection/repository"

@injectable()
export class AuthService {
  public async signUp(username: string, password: string) {
    const isExistsUser = await UserRepository
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getExists()
    if (isExistsUser) {
      throw new Error("username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const createdUser = UserRepository.create({
      username: username,
      password: hashedPassword,
    })
    await UserRepository.save(createdUser)

    return createdUser
  }
}

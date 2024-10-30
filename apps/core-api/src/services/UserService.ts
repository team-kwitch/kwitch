import { injectable } from "inversify"
import { UserRepository } from "@kwitch/persistence/repository"
import { User } from "@kwitch/domain"

@injectable()
export class UserService {
  async fetchUserByUsername(username: string): Promise<User> {
    return await UserRepository.createQueryBuilder("user")
      .where("user.username = :username", { username })
      .leftJoinAndSelect("user.channel", "channel")
      .getOneOrFail()
  }
}

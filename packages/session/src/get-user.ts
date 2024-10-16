import { UserRepository } from "@kwitch/db-connection/repository"

async function getUserWithChannelById(userId: number) {
  const user = await UserRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.channel", "channel")
    .where("user.id = :id", { id: userId })
    .getOneOrFail()

  return user
}

async function getUserWithChannelByUsername(username: string) {
  const user = await UserRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.channel", "channel")
    .where("user.username = :username", { username })
    .getOneOrFail()

  return user
}

export { getUserWithChannelById, getUserWithChannelByUsername }

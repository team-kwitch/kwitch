import { dataSource } from "../data-source.js";
import { UserEntity } from "../entity/user.entity.js";

export const UserRepository = dataSource.getRepository(UserEntity)

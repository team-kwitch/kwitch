import { dataSource } from "../data-source.js";
import { UserEntity } from "../entity/UserEntity.js";

export const UserRepository = dataSource.getRepository(UserEntity);
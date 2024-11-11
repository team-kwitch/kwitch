import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user.entity.js"
import { ChannelEntity } from "./entity/channel.entity.js"
import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
} from "./env.js"

export const dataSource = new DataSource({
  type: "postgres",
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: process.env.NODE_ENV !== "production",
  logger: "advanced-console",
  logging: process.env.NODE_ENV !== "production",
  entities: [UserEntity, ChannelEntity],
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: "migrations",
  migrationsRun: false,
})

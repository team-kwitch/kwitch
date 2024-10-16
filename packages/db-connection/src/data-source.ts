import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserEntity } from "./entity/UserEntity.js"
import { ChannelEntity } from "./entity/ChannelEntity.js"
import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
} from "./config.js"

export const dataSource = new DataSource({
  type: "postgres",
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [UserEntity, ChannelEntity],
})

await dataSource.initialize()

const closeDataSource = async () => {
  try {
    await dataSource.destroy()
    console.log("[db-connection] dataSource closed")
  } catch (error) {
    console.error("[db-connection] during dataSource close:", error)
  }
}

process.on("exit", closeDataSource)
process.on("SIGINT", async () => {
  await closeDataSource()
  process.exit(0)
})

import { Redis } from "ioredis"
import { ENV } from "./env.js"

export const redis = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  username: "",
  password: ENV.REDIS_PASSWORD,
})

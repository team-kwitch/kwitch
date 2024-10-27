import { Redis } from "ioredis"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./config.js"

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
})

await redis.flushall()

export { redis }

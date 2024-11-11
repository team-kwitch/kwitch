import { Redis } from "ioredis"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./env.js"

const redis = new Redis({
  host: REDIS_HOST,
  username: "",
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  lazyConnect: true,
})

export { redis }

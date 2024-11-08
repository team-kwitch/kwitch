import { Redis } from "ioredis"
import "dotenv/config"

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  password: process.env.REDIS_PASSWORD || undefined,
  port: 6379,
})

export const POSTGRES_HOST = process.env.POSTGRES_HOST || "localhost"
export const POSTGRES_PORT = process.env.POSTGRES_PORT
  ? parseInt(process.env.POSTGRES_PORT, 10)
  : 5432
export const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || "postgres"
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "develop"
export const POSTGRES_DB = process.env.POSTGRES_DB || "kwitch"

export const REDIS_HOST = process.env.REDIS_HOST || "localhost"
export const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT, 10)
  : 6379
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ""
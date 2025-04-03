import { registerAs } from "@nestjs/config"

export const appConfigs = registerAs("app", () => ({
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ACCESS_TOKEN_COOKIE_DOMAIN: process.env.ACCESS_TOKEN_COOKIE_DOMAIN,
}))

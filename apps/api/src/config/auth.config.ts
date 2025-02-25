import { registerAs } from "@nestjs/config"

export const authConfigs = registerAs("auth", () => ({
  JWT_SECRET: process.env.JWT_SECRET,

  OAUTH2_GOOGLE_CLIENT_ID: process.env.OAUTH2_GOOGLE_CLIENT_ID,
  OAUTH2_GOOGLE_CLIENT_SECRET: process.env.OAUTH2_GOOGLE_CLIENT_SECRET,
  OAUTH2_GOOGLE_CALLBACK_URL: process.env.OAUTH2_GOOGLE_CALLBACK_URL,
}))

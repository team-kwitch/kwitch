import { registerAs } from "@nestjs/config"

export const authConfigs = registerAs("auth", () => ({
  JWT_SECRET: process.env.JWT_SECRET,
}))

import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { registerAs } from "@nestjs/config"

export const typeOrmConfigs = registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USERNAME || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "kwitch",
    entities: [`${__dirname}/../**/*.entity.js`],
    synchronize: true,
    logger: "simple-console",
    logging: process.env.NODE_ENV !== "production",
  }),
)

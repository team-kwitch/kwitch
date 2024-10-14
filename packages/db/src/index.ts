import { PrismaClient } from "@prisma/client"
import { createClient } from "redis";

import { REDIS_URL } from "./config/index.js";

export const prismaClient = new PrismaClient();

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error(err);
});

redisClient.on("connect", () => {
  console.log("[redis] connected to Redis");
});

await redisClient.connect();

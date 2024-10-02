import { createClient } from "redis";

import { REDIS_HOST, REDIS_PORT } from "../config";

const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

redisClient.on("error", (err) => {
  console.error(err);
});

redisClient.on("connect", () => {
  console.log("[redis] connected to Redis");
});

export { redisClient };

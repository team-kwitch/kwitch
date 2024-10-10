import { createClient } from "redis";

import { REDIS_URL } from "../config";

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error(err);
});

redisClient.on("connect", () => {
  console.log("[redis] connected to Redis");
});

await redisClient.connect();

export { redisClient };

import * as dotenv from "dotenv";
import { rootPath } from "get-root-path";
import path from "path";

dotenv.config({
  path: path.join(rootPath, ".env"),
});

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const REDIS_URL = redisUrl;

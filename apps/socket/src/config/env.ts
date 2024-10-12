import * as dotenv from "dotenv";
import path from "path";
import { rootPath } from "get-root-path";

dotenv.config({
  path: path.join(rootPath, "../../../.env"),
});

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    console.error("[api] [config] SECRET_KEY is not defined");
    process.exit(1);
}

export const SECRET_KEY = secretKey as string;

export const MEDIASOUP_LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1";
export const MEDIASOUP_ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUNCED_IP || null;

export const MEDIASOUP_MIN_PORT = Number(process.env.MEDIASOUP_MIN_PORT) || 40000;
export const MEDIASOUP_MAX_PORT = Number(process.env.MEDIASOUP_MAX_PORT) || 49999;
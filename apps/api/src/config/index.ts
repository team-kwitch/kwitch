import * as dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    console.error("[api] [config] SECRET_KEY is not defined");
    process.exit(1);
}

export const SECRET_KEY = secretKey as string;

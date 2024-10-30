import dotenv from "dotenv"
import path from "node:path"

const __dirname = path.resolve()

if (process.env.NODE_ENV === "production") {
    dotenv.config({
        path: path.join(__dirname, "../../.env.production"),
    })
}

export const MEDIASOUP_LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0"
export const MEDIASOUP_ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUCED_IP || null
export const MEDIASOUP_TRANSPORT_MIN_PORT = process.env.MEDIASOUP_TRANSPORT_MIN_PORT || "40000"
export const MEDIASOUP_TRANSPORT_MAX_PORT = process.env.MEDIASOUP_TRANSPORT_MAX_PORT || "49999"
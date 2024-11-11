export const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || "session_secret_key";

export const MEDIASOUP_LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1";
export const MEDIASOUP_ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUNCED_IP || undefined;
export const MEDIASOUP_MIN_PORT = process.env.MEDIASOUP_MIN_PORT || "40000";
export const MEDIASOUP_MAX_PORT = process.env.MEDIASOUP_MAX_PORT || "49999";
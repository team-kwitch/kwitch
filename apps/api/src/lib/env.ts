export const ENV = {
    SESSION_SECRET: process.env.SESSION_SECRET || "develop",

    MEDIASOUP_LISTEN_IP: process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1",
    MEDIASOUP_ANNOUNCED_IP: process.env.MEDIASOUP_ANNOUCED_IP || null,
    MEDIASOUP_TRANSPORT_MIN_PORT: parseInt(process.env.MEDIASOUP_TRANSPORT_MIN_PORT || "40000"),
    MEDIASOUP_TRANSPORT_MAX_PORT: parseInt(process.env.MEDIASOUP_TRANSPORT_MAX_PORT || "49999"),

    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "develop",
    REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379"),
}
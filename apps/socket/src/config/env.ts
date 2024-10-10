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
export const MEDIASOUP_CONFIG = {
  routerOptions: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "4d0032",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
    ],
  },
  webRtcServerOptions: {
    listenInfos: [
      {
        protocol: "udp",
        ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
        announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        port: 44444,
      },
      {
        protocol: "tcp",
        ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
        announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        port: 44444,
      },
    ],
  },
  transportOptions: {
    listenInfos: [
      {
        protocol: "udp",
        ip: "0.0.0.0",
        announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        port: 40000,
        portRange: {
          min: parseInt(process.env.MEDIASOUP_MIN_PORT || "40000", 10),
          max: parseInt(process.env.MEDIASOUP_MAX_PORT || "49999", 10),
        },
      },
      {
        protocol: "tcp",
        ip: "0.0.0.0",
        announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        port: 40000,
        portRange: {
          min: parseInt(process.env.MEDIASOUP_MIN_PORT || "40000", 10),
          max: parseInt(process.env.MEDIASOUP_MAX_PORT || "49999", 10),
        },
      },
    ],
  },
};

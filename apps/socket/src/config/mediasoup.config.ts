import { MEDIASOUP_ANNOUNCED_IP, MEDIASOUP_LISTEN_IP, MEDIASOUP_MAX_PORT, MEDIASOUP_MIN_PORT } from "./env";

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
        ip: MEDIASOUP_LISTEN_IP,
        announcedAddress: MEDIASOUP_ANNOUNCED_IP,
        port: 44444,
      },
      {
        protocol: "tcp",
        ip: MEDIASOUP_LISTEN_IP,
        announcedAddress: MEDIASOUP_ANNOUNCED_IP,
        port: 44444,
      },
    ],
  },
  transportOptions: {
    listenInfos: [
      {
        protocol: "udp",
        ip: MEDIASOUP_LISTEN_IP,
        announcedAddress: MEDIASOUP_ANNOUNCED_IP,
        port: 40000,
        portRange: {
          min: MEDIASOUP_MIN_PORT,
          max: MEDIASOUP_MAX_PORT,
        },
      },
      {
        protocol: "tcp",
        ip: MEDIASOUP_LISTEN_IP,
        announcedAddress: MEDIASOUP_ANNOUNCED_IP,
        port: 40000,
        portRange: {
          min: MEDIASOUP_MIN_PORT,
          max: MEDIASOUP_MAX_PORT,
        },
      },
    ],
  },
};

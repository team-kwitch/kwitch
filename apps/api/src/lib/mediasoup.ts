import { ENV } from "./env.js";

export const mediasoupConfigs = {
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
  transportOptions: {
    listenInfos: [
      {
        protocol: "udp",
        ip: ENV.MEDIASOUP_LISTEN_IP,
        announcedAddress: ENV.MEDIASOUP_ANNOUNCED_IP,
        portRange: {
          min: ENV.MEDIASOUP_TRANSPORT_MIN_PORT,
          max: ENV.MEDIASOUP_TRANSPORT_MAX_PORT,
        },
      },
      {
        protocol: "tcp",
        ip: ENV.MEDIASOUP_LISTEN_IP,
        announcedAddress: ENV.MEDIASOUP_ANNOUNCED_IP,
        portRange: {
          min: ENV.MEDIASOUP_TRANSPORT_MIN_PORT,
          max: ENV.MEDIASOUP_TRANSPORT_MAX_PORT,
        },
      },
    ],
  },
}

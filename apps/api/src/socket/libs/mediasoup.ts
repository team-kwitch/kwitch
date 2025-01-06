import os from "node:os"
import {
  MEDIASOUP_ANNOUNCED_IP,
  MEDIASOUP_LISTEN_IP,
  MEDIASOUP_WEBRTC_SERVER_PORT,
} from "#/libs/env.js"

export const mediasoupConfigs = {
  numWorkers: process.env.NODE_ENV === "production" ? Object.keys(os.cpus()).length : 1,
  workerSettings: {
    logLevel: "warn",
    logTags: [
      "info",
      "ice",
      "dtls",
      "rtp",
      "srtp",
      "rtcp",
      "rtx",
      "bwe",
      "score",
      "simulcast",
      "svc",
      "sctp",
    ],
    disableLiburing: false,
  },
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
        port: parseInt(MEDIASOUP_WEBRTC_SERVER_PORT),
      },
      {
        protocol: "tcp",
        ip: MEDIASOUP_LISTEN_IP,
        announcedAddress: MEDIASOUP_ANNOUNCED_IP,
        port: parseInt(MEDIASOUP_WEBRTC_SERVER_PORT),
      },
    ],
  },
}

import { ConfigService, registerAs } from "@nestjs/config"
import mediasoup from "mediasoup"
import os from "node:os"

type MediasoupConfigs = {
  numWorkers: number
  workerSettings: mediasoup.types.WorkerSettings
  routerOptions: mediasoup.types.RouterOptions
  webRtcServerOptions: mediasoup.types.WebRtcServerOptions
}

export const mediasoupConfigs = registerAs(
  "mediasoup",
  (): MediasoupConfigs => ({
    numWorkers:
      process.env.NODE_ENV === "production" ? Object.keys(os.cpus()).length : 1,
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
          ip: process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP || undefined,
          port: process.env.MEDIASOUP_WEBRTC_SERVER_PORT
            ? parseInt(process.env.MEDIASOUP_WEBRTC_SERVER_PORT)
            : 44444,
        },
        {
          protocol: "tcp",
          ip: process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP || undefined,
          port: process.env.MEDIASOUP_WEBRTC_SERVER_PORT
            ? parseInt(process.env.MEDIASOUP_WEBRTC_SERVER_PORT)
            : 44444,
        },
      ],
    },
  }),
)

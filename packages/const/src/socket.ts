export const SOCKET_EVENTS = {
  STREAMING_START: "streaming:start",
  STREAMING_UPDATE: "streaming:update",
  STREAMING_END: "streaming:end",
  STREAMING_JOIN: "streaming:join",
  STREAMING_LEAVE: "streaming:leave",

  MEDIASOUP_GET_ROUTER_RTP_CAPABILITIES:
    "mediasoup:get-router-rtp-capabilities",
  MEDIASOUP_CREATE_TRANSPORT: "mediasoup:create-transport",
  MEDIASOUP_CONNECT_TRANSPORT: "mediasoup:connect-transport",
  MEDIASOUP_PRODUCER: "mediasoup:producer",
  MEDIASOUP_CONSUMER: "mediasoup:consumer",
  MEDIASOUP_RESUME_CONSUMER: "mediasoup:resume-consumer",
  MEDIASOUP_GETALL_PRODUCER: "mediasoup:getall-producer",
  MEDIASOUP_CLOSE_PRODUCER: "mediasoup:close-producer",
} as const

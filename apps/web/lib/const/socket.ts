export const SOCKET_EVENTS = {
  STREAMING_START: "streaming:start",
  STREAMING_UPDATE: "streaming:update",
  STREAMING_JOIN: "streaming:join",
  STREAMING_END: "streaming:end",
  STREAMING_LEAVE: "streaming:leave",

  CHAT_SEND: "chat:send",

  MEDIASOUP_CREATE_TRANSPORT: "mediasoup:create-transport",
  MEDIASOUP_CONNECT_TRANSPORT: "mediasoup:connect-transport",
  MEDIASOUP_PRODUCER: "mediasoup:producer",
  MEDIASOUP_CONSUMER: "mediasoup:consumer",
  MEDIASOUP_RESUME_CONSUMER: "mediasoup:resume-consumer",
  MEDIASOUP_GETALL_PRODUCER: "mediasoup:getall-producer",
} as const

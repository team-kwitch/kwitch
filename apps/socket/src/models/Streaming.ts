import * as mediasoup from "mediasoup";

import { Channel } from "@kwitch/types";
import { MEDIASOUP_CONFIG } from "@kwitch/config";

import { getWorker } from "./Worker";

export interface Viewer {
  recvTransport: mediasoup.types.WebRtcTransport;
  consumers: Map<string, mediasoup.types.Consumer>; // Map<consumerId, Consumer>
}

export interface Streamer {
  sendTransport: mediasoup.types.WebRtcTransport;
  producers: Map<string, mediasoup.types.Producer>; // Map<producerId, Producer>
}

export class Streaming {
  private readonly router: mediasoup.types.Router;
  private readonly streamer: Streamer;
  private readonly viewers: Map<string, Viewer>; // Map<socketId, Peer>

  public title: string;
  public channelId: string;

  private constructor({
    channelId,
    router,
  }: {
    channelId: string;
    router: mediasoup.types.Router;
  }) {
    this.router = router;
    this.streamer = {
      sendTransport: null,
      producers: new Map(),
    };
    this.viewers = new Map();
    this.channelId = channelId;
  }

  public static async create(channelId: string) {
    const worker = getWorker();
    const { routerOptions } = MEDIASOUP_CONFIG;
    const router = await worker.createRouter(routerOptions as mediasoup.types.RouterOptions);

    return new Streaming({
      channelId,
      router,
    });
  }

  public getRouter() {
    return this.router;
  }

  public getChannelId() {
    return this.channelId;
  }

  public getSendTransport() {
    return this.streamer.sendTransport;
  }

  public getRecvTransport(socketId: string) {
    return this.viewers.get(socketId).recvTransport;
  }

  public getProducer(producerId: string) {
    return this.streamer.producers.get(producerId);
  }

  public getConsumer(socketId: string, consumerId: string) {
    return this.viewers.get(socketId).consumers.get(consumerId);
  }

  public getProducerIds() {
    return Array.from(this.streamer.producers.keys());
  }

  public setSendTransport(transport: mediasoup.types.WebRtcTransport) {
    this.streamer.sendTransport = transport;
  }

  public setRecvTransport(
    socketId: string,
    transport: mediasoup.types.WebRtcTransport,
  ) {
    if (!this.viewers.has(socketId)) {
      this.viewers.set(socketId, { recvTransport: null, consumers: new Map() });
    }
    this.viewers.get(socketId).recvTransport = transport;
  }

  public addProducer(producer: mediasoup.types.Producer) {
    this.streamer.producers.set(producer.id, producer);
  }

  public addConsumer(socketId: string, consumer: mediasoup.types.Consumer) {
    if (!this.viewers.has(socketId)) {
      this.viewers.set(socketId, { recvTransport: null, consumers: new Map() });
    }
    this.viewers.get(socketId).consumers.set(consumer.id, consumer);
  }
}

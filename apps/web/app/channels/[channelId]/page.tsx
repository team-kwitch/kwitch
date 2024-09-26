"use client";

import { useEffect, useState, useRef } from "react";

import Chat from "@/components/channels/chat";
import { useToast } from "@/components/ui/use-toast";
import { SignalSlashIcon } from "@heroicons/react/24/solid";
import { useSocket } from "@/components/socket-provider";
import { SocketResponse } from "@/types/socket";
import { useParams } from "next/navigation";
import * as mediasoup from "mediasoup-client";
import assert from "assert";

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>();
  const { channelId } = params;

  const { socket, emitAsync } = useSocket();
  const { toast } = useToast();

  const [onAir, setOnAir] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rtpCapabilities = useRef<mediasoup.types.RtpCapabilities | null>(null);
  const device = useRef<mediasoup.types.Device | null>(null);
  const recvTransport = useRef<mediasoup.types.Transport | null>(null);

  // TODO: handle when broadcaster turn on the stream after broadcaster turn off the stream

  const _createDevice = async () => {
    device.current = new mediasoup.Device();
    assert(rtpCapabilities.current, "RTP Capabilities is not defined.");
    await device.current.load({
      routerRtpCapabilities: rtpCapabilities.current,
    });
    await _createRecvTransport();
    await _getProducer();
  };

  const _getProducer = async () => {
    const { producerIds } = await emitAsync("sfu:get-producers", { channelId });
    console.log("producer IDs: ", producerIds);
    for (const producerId of producerIds) {
      await _createConsumer(producerId);
    }
  };

  const _createRecvTransport = async () => {
    const transportOptions = await emitAsync("sfu:create-transport", {
      channelId,
      isSender: false,
    }) as mediasoup.types.TransportOptions;
    console.log("Transport Options: ", transportOptions);

    assert(device.current, "Device is not defined.");
    recvTransport.current =
      device.current.createRecvTransport(transportOptions);

    recvTransport.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          socket.emit("sfu:recv-transport-connect", {
            channelId,
            dtlsParameters,
          });
          callback();
        } catch (err: any) {
          errback(err);
        }
      }
    );
  };

  const _createConsumer = async (producerId: string) => {
    assert(device.current, "Device is not defined."); 
    assert(recvTransport.current, "Recv Transport is not defined.");
    const consumerOptions = await emitAsync("sfu:transport-consume", {
      channelId,
      producerId,
      rtpCapabilities: device.current.rtpCapabilities,
    }) as mediasoup.types.ConsumerOptions;
    console.log("consumer options: ", consumerOptions);
    const consumer = await recvTransport.current.consume(consumerOptions);
    console.log("consumer ID: ", consumer.id);

    assert(videoRef.current, "Video element is not defined.");
    const { track } = consumer;
    if (consumer.kind === "video") {
      videoRef.current.srcObject = new MediaStream([track]);
      socket.emit("sfu:consumer-resume", {
        channelId,
        consumerId: consumer.id,
      });
    } else if (consumer.kind === "audio") {
      // TODO: add audio element
    }
  };

  useEffect(() => {
    socket.emit("broadcasts:join", channelId, async (res: SocketResponse) => {
      try {
        if (res.success === false) {
          setOnAir(false);
          throw new Error(res.message);
        }

        rtpCapabilities.current = res.content.rtpCapabilities;
        console.log("RTP Capabilities: ", rtpCapabilities.current);
        await _createDevice();
      } catch (err: any) {
        console.error("Error joining the channel: ", err);
        toast({
          title: "Failed to join the channel. Refresh the page.",
          description: err.message,
          variant: "destructive",
        });
      }
    });

    socket.on("broadcasts:destroy", () => {
      toast({
        title: "The broadcaster closed the channel.",
        variant: "destructive",
      });
      setOnAir(false);
    });

    return () => {
      if (!onAir) return;
      socket.emit("broadcasts:leave", channelId, (res: SocketResponse) => {
        if (!res.success) {
          toast({
            title: "Failed to leave the channel.",
            description: "Something is wrong. Refresh the page.",
            variant: "destructive",
          });
        }
      });

      socket.off("broadcasts:destroy");
    };
  }, []);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {onAir ? (
        <>
          <video className="h-full bg-black" ref={videoRef} autoPlay />
          <Chat channelId={channelId} />
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center">
          <SignalSlashIcon className="w-20 h-20" />
          <h1 className="text-lg text-gray-500">Channel is offline.</h1>
        </div>
      )}
    </div>
  );
}

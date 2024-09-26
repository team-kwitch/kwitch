"use client";

import { useRef, useState } from "react";

import Chat from "@/components/channels/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { SignalIcon } from "@heroicons/react/20/solid";
import { useToast } from "@/components/ui/use-toast";
import { videoOptions, useSocket } from "@/components/socket-provider";
import * as mediasoup from "mediasoup-client";
import { SocketResponse } from "@/types/socket";
import { useAuth } from "@/components/auth-provider";
import assert from "assert";

export default function Broadcast() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { socket } = useSocket();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioParams = useRef<mediasoup.types.ProducerOptions | null>(null);
  const videoParams = useRef<mediasoup.types.ProducerOptions | null>(null);
  const device = useRef<mediasoup.types.Device | null>(null);
  const rtpCapabilities = useRef<mediasoup.types.RtpCapabilities | null>(null);
  const sendTransport = useRef<mediasoup.types.Transport | null>(null);
  const audioProducer = useRef<mediasoup.types.Producer | null>(null);
  const videoProducer = useRef<mediasoup.types.Producer | null>(null);

  const [title, setTitle] = useState("");
  const [warning, setWarning] = useState("");
  const [onAir, setOnAir] = useState(false);

  const startBroadcast = () => {
    if (!title || onAir) return;

    socket.emit("broadcasts:start", title, async (res: SocketResponse) => {
      if (res.success === false) {
        setWarning(res.message);
        return;
      }

      rtpCapabilities.current = res.content.rtpCapabilities;
      console.log("RTP Capabilities: ", rtpCapabilities.current);
      await _createDevice();

      setWarning("");
      setOnAir(true);
    });
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      });
      await _onStreamSuccess(stream);
    } catch (err: any) {
      console.error(err);
    }
  };

  const _onStreamSuccess = async (stream: MediaStream) => {
    assert(videoRef.current, "Video ref is not defined");
    videoRef.current.srcObject = stream;

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    if (audioTrack) {
      audioParams.current = { track: stream.getAudioTracks()[0] };
    }
    if (videoTrack) {
      videoParams.current = {
        track: stream.getVideoTracks()[0],
        ...videoOptions,
      };
    }

    await _createProducer();
  };

  const _createDevice = async () => {
    device.current = new mediasoup.Device();
    assert(rtpCapabilities.current, "RTP Capabilities is not defined");
    await device.current.load({
      routerRtpCapabilities: rtpCapabilities.current,
    });
    _createSendTransport();
  };

  const _createSendTransport = () => {
    assert(user, "User is not defined");

    socket.emit(
      "sfu:create-transport",
      { channelId: user.channel.id, isSender: true },
      async (res: SocketResponse) => {
        if (res.success === false) {
          console.error(res.message);
          return;
        }

        const transportOptions =
          res.content as mediasoup.types.TransportOptions;
        console.log("Transport Options: ", transportOptions);

        assert(device.current, "Device is not defined");
        sendTransport.current =
          device.current.createSendTransport(transportOptions);
        console.log("producer transport ID: ", sendTransport.current.id);

        sendTransport.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              socket.emit("sfu:send-transport-connect", {
                channelId: user.channel.id,
                dtlsParameters,
              });
              callback();
            } catch (err: any) {
              errback(err);
            }
          }
        );

        sendTransport.current.on(
          "produce",
          async (parameters, callback, errback) => {
            try {
              socket.emit(
                "sfu:transport-produce",
                {
                  channelId: user.channel.id,
                  producerOptions: {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                  },
                },
                (res: SocketResponse) => {
                  if (res.success === false) {
                    throw new Error(res.message);
                  }
                  callback({ id: res.content.id });
                }
              );
            } catch (err: any) {
              errback(err);
            }
          }
        );
      }
    );
  };

  const _createProducer = async () => {
    assert(sendTransport.current, "Producer Transport is not defined");

    if (audioParams.current) {
      audioProducer.current = await sendTransport.current.produce(
        audioParams.current
      );
      audioProducer.current.on("transportclose", () => {
        console.log("Audio Producer Transport Closed");
      });
      audioProducer.current.on("trackended", () => {
        console.log("Audio Producer Track Ended");
      });
    }
    if (videoParams.current) {
      videoProducer.current = await sendTransport.current.produce(
        videoParams.current
      );
      videoProducer.current.on("transportclose", () => {
        console.log("Video Producer Transport Closed");
      });
      videoProducer.current.on("trackended", () => {
        console.log("Video Producer Track Ended");
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex relative">
      <div className="container max-w-7xl py-8 overflow-y-auto scroll">
        <h1 className="text-4xl font-bold mb-5">Broadcasting</h1>
        <div className="flex items-center gap-x-4 mb-5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={onAir}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-x-3 mb-5">
          <Button disabled={onAir} onClick={startBroadcast} className="mr-3">
            Start
          </Button>
          {onAir && (
            <>
              <SignalIcon className="w-4 h-4 inline-block text-red-600"></SignalIcon>
              <span>On Air</span>
            </>
          )}
        </div>
        {!onAir && warning && (
          <div className="w-1/2 bg-red-600 text-white opacity-80 rounded-xl p-5">
            <AlertTriangle className="w-6 h-6 inline-block mr-3"></AlertTriangle>
            <span>{warning}</span>
          </div>
        )}
        {onAir && (
          <>
            <div className="w-1/2 bg-yellow-600 text-white opacity-80 rounded-xl p-5 mb-5">
              <AlertTriangle className="w-6 h-6 inline-block mr-3"></AlertTriangle>
              <span>
                If this page is turned off, the broadcast will also be turned
                off.
              </span>
            </div>
            <Button onClick={getLocalStream} className="mb-5">
              Screen
            </Button>
            <div className="flex items-center gap-x-4 mb-5">
              <p className="text-sm font-medium">Video</p>
            </div>
            <video
              className="w-[600px] h-[400px] bg-black border"
              autoPlay
              playsInline
              muted
              ref={videoRef}
            />
          </>
        )}
      </div>
      {onAir && <Chat channelId={user.channel.id} />}
    </div>
  );
}

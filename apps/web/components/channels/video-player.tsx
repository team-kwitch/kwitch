"use client";

import assert from "assert";
import * as mediasoup from "mediasoup-client";
import { redirect } from "next/dist/server/api-utils";
import React, { useEffect, useRef } from "react";

import { useToast } from "@/components/ui/use-toast";
import { SocketResponse } from "@/types/socket";

import { useSocket } from "../socket-provider";

export default function VideoPlayer({
  channelId,
  videoRef,
}: {
  channelId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  // TODO: video overflow
}

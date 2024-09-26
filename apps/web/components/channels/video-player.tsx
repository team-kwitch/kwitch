"use client";

import React, { useEffect, useRef } from "react";
import { useSocket } from "../socket-provider";
import * as mediasoup from "mediasoup-client";
import { SocketResponse } from "@/types/socket";
import { useToast } from "@/components/ui/use-toast";
import assert from "assert";
import { redirect } from "next/dist/server/api-utils";

export default function VideoPlayer({ channelId, videoRef }: { channelId: string, videoRef: React.RefObject<HTMLVideoElement | null> }) {
  // TODO: video overflow
}

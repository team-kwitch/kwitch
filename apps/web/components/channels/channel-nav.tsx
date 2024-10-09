"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import ChannelNavItem from "./channel-nav-item";
import { api } from "@/lib/axios";
import { Streaming } from "@kwitch/types"
import { useSocket } from "../socket-provider";

export default function ChannelNav() {
  const { socket } = useSocket();
  const [foldNav, setFoldNav] = useState(false);
  const [streamings, setStreamings] = useState<Streaming[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const getStreamings = async () => {
      socket.emit("streamings:get-list", (streamings: Streaming[]) => {
        setStreamings(streamings);
      });

      timer = setTimeout(() => getStreamings(), 10000);
    };

    getStreamings();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`border-r bg-gray-200 dark:bg-gray-900 min-w-[56px] ${
        foldNav ? "" : "xl:w-80"
      } flex flex-col`}
    >
      {foldNav && (
        <ArrowRightCircleIcon
          className="w-8 h-8 m-3 cursor-pointer hidden xl:block"
          onClick={() => setFoldNav(false)}
        />
      )}
      <div
        className={`hidden ${
          foldNav ? "" : "xl:flex"
        } justify-between items-center p-3`}
      >
        <p className="font-bold">Online channel list</p>
        <ArrowLeftCircleIcon
          className="w-6 h-6 cursor-pointer"
          onClick={() => setFoldNav(true)}
        />
      </div>
      {streamings.map((streaming) => (
        <ChannelNavItem
          key={streaming.channel.id}
          streaming={streaming}
          foldNav={foldNav}
        />
      ))}
    </div>
  );
}

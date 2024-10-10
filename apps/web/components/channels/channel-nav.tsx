"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import ChannelNavItem from "./channel-nav-item";
import { api } from "@/lib/axios";
import { LiveChannel } from "@kwitch/types"
import { useToast } from "../ui/use-toast";

export default function ChannelNav() {
  const { toast } = useToast();
  const [foldNav, setFoldNav] = useState(false);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchLiveChannels = async () => {
      const res = await api.get("/api/live-channels");
      if (res.data.success) {
        const liveChannels = res.data.content.liveChannels;
        console.log(liveChannels);
        setLiveChannels(liveChannels);

        timer = setTimeout(() => fetchLiveChannels(), 10000);
      } else {
        toast({
          title: "Failed to fetch live channels",
          variant: "destructive",
        })
      }
    };

    fetchLiveChannels();

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
        <p className="font-bold">Live Channel List</p>
        <ArrowLeftCircleIcon
          className="w-6 h-6 cursor-pointer"
          onClick={() => setFoldNav(true)}
        />
      </div>
      {liveChannels.map((liveChannel) => (
        <ChannelNavItem
          key={liveChannel.channel.id}
          liveChannel={liveChannel}
          foldNav={foldNav}
        />
      ))}
    </div>
  );
}

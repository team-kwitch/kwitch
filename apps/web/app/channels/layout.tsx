"use client";

import { useEffect } from "react";

import ChannelNav from "@/components/channels/channel-nav";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { useAuth } from "@/components/auth-provider";

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in?redirect=/channels");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex">
      <ChannelNav />
      <div className="flex-1 flex">{children}</div>
    </div>
  );
}

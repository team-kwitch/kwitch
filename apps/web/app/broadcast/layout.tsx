"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { SocketProvider } from "../../components/socket-provider";
import { useAuth } from "@/components/auth-provider";

export default function BroadcastLayout({
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
    <SocketProvider>
      <div className="flex-1 flex">{children}</div>
    </SocketProvider>
  );
}

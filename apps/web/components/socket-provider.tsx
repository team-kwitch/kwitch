"use client";

import { API_URL } from "@/utils/env";
import { createContext, useContext, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./auth-provider";
import { SocketResponse } from "@/types/socket";

const SocketContext = createContext<Socket | undefined>(undefined);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const socketRef = useRef<Socket>(
    io(API_URL, {
      path: "/socket.io/",
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    })
  );

  useEffect(() => {
    if (user) {
      socketRef.current.connect();
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const videoOptions = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  const emitAsync = (event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      socket.emit(event, data, (res: SocketResponse) => {
        console.log("Socket response: ", res);
        if (res.success === false) {
          reject(new Error(res.message));
        } else {
          resolve(res.content);
        }
      });
    });
  };

  return {
    socket,
    emitAsync,
  };
};

export { SocketProvider, useSocket };

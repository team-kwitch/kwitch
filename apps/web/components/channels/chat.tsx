"use client";

import React, { useEffect, useState } from "react";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";

import MessageBox from "./message-box";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useSocket } from "../socket-provider";
import { useAuth } from "../auth-provider";
import assert from "assert";
import { Message, CustomResponse } from "@kwitch/types";

export default function Chat({ channelId }: { channelId: string }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  if (!user) {
    throw new Error("User is not defined");
  }

  // TODO: restrict amount of messages
  const [messages, setMessages] = useState<Message[]>([
    { username: "admin", message: "Welcome to the chat!", isAlert: true },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [closeChat, setCloseChat] = useState(false);

  useEffect(() => {
    socket.on("streamings:joined", (username: string) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "admin",
          message: `${username} joined the chat!`,
          isAlert: true,
        },
      ]);
    });

    socket.on("streamings:left", (username: string) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "admin",
          message: `${username} left the chat!`,
          isAlert: true,
        },
      ]);
    });

    socket.on(
      "messages:sent",
      (username: string, message: string, isStreamer: boolean) => {
        setMessages((prev) => [...prev, { username, message, isStreamer }]);
      }
    );

    return () => {
      socket.off("streamings:joined");
      socket.off("streamings:left");
      socket.off("messages:sent");
    };
  }, []);

  const submitMessage = () => {
    assert(user, "User is not defined");
    if (!currentMessage) {
      return;
    }
    socket.emit(
      "messages:send",
      channelId,
      user.id,
      currentMessage,
      (res: CustomResponse) => {
        setMessages((prev) => [
          ...prev,
          {
            username: user!.username,
            message: currentMessage,
            isStreamer: channelId === user.channel!.id,
          },
        ]);
      }
    );
    setCurrentMessage("");
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div
      className={
        "absolute h-full border-l w-80 flex flex-col transition-all duration-500 bg-gray-100 dark:bg-gray-900 " +
        (closeChat ? "-right-80" : "right-0")
      }
    >
      <Bars3BottomLeftIcon
        className={
          "w-6 h-6 absolute top-3 cursor-pointer transition-all duration-500 " +
          (closeChat ? "-left-8" : "left-2")
        }
        onClick={() => setCloseChat(!closeChat)}
      />
      <h1 className="text-lg text-center border-b py-2">Chat</h1>
      <div className="flex-1 flex flex-col-reverse p-3 scrollbar-thin scrollbar-thumb-kookmin scrollbar-track-white h-32 overflow-y-auto">
        <div>
          {messages.map((message, index) => (
            <MessageBox key={index} message={message} />
          ))}
        </div>
      </div>
      <div className="flex flex-col p-3">
        <Label htmlFor="msg" />
        <div className="grid w-full gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleOnKeyDown}
            className="min-h-0 resize-none"
            placeholder="Type your message here"
            id="msg"
          />
          <Button
            size="sm"
            className="bg-kookmin dark:text-white"
            onClick={submitMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

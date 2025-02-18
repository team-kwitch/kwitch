"use client"

import React, { useEffect, useState } from "react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid"

import { Label } from "@kwitch/ui/components/ui/label"
import { Button } from "@kwitch/ui/components/ui/button"
import { Textarea } from "@kwitch/ui/components/ui/textarea"
import assert from "assert"
import { Chat, APIResponse } from "@kwitch/types"
import ChatItemComponent from "./chat-item"
import { SOCKET_EVENTS } from "@/const/socket"
import { useAuth } from "@/provider/auth-provider"
import { useSocket } from "@/provider/socket-provider"

export default function ChatComponent({ channelId }: { channelId: string }) {
  const { user, isLoading } = useAuth()
  const { socket } = useSocket()

  // TODO: restrict amount of chats
  const [chats, setChats] = useState<Chat[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [closeChat, setCloseChat] = useState(false)

  useEffect(() => {
    if (!socket) return

    socket.on(SOCKET_EVENTS.STREAMING_JOIN, (username: string) => {
      setChats((prev) => [
        ...prev,
        {
          username: "System",
          message: `${username} has joined the chat.`,
          isStreamer: false,
        },
      ])
    })

    socket.on(SOCKET_EVENTS.STREAMING_LEAVE, (username: string) => {
      setChats((prev) => [
        ...prev,
        {
          username: "System",
          message: `${username} has left the chat.`,
          isStreamer: false,
        },
      ])
    })

    socket.on(SOCKET_EVENTS.CHAT_SEND, (chat: Chat) => {
      setChats((prev) => [
        ...prev,
        {
          username: chat.username,
          message: chat.message,
          isStreamer: chat.isStreamer,
        },
      ])
    })

    return () => {
      socket.off(SOCKET_EVENTS.STREAMING_JOIN)
      socket.off(SOCKET_EVENTS.STREAMING_LEAVE)
      socket.off(SOCKET_EVENTS.CHAT_SEND)
    }
  }, [socket])

  const submitMessage = () => {
    if (!currentMessage) {
      return
    }

    assert(user, "User is not defined.")
    socket?.emit(SOCKET_EVENTS.CHAT_SEND, {
      channelId,
      message: currentMessage,
    })
    setCurrentMessage("")
  }

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return
      }
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <div
      className={
        "hidden md:flex md:w-96 flex-col relative border-l bg-gray-100 dark:bg-gray-900" +
        (closeChat ? " !absolute translate-x-[100vw]" : "")
      }
    >
      <Bars3BottomLeftIcon
        className={
          "absolute w-6 h-6 cursor-pointer translate-x-2 translate-y-2 hover:bg-gray-400 rounded-sm" +
          (closeChat ? " !-translate-x-10" : "")
        }
        onClick={() => setCloseChat(!closeChat)}
      />
      <h1 className='text-lg text-center border-b py-2'>Chat</h1>
      <div className='flex-grow flex flex-col-reverse p-3 scrollbar-thin scrollbar-thumb-kookmin scrollbar-track-white h-32 overflow-y-auto'>
        <div>
          {chats.map((chat, index) => (
            <ChatItemComponent key={index} chat={chat} />
          ))}
        </div>
      </div>
      <div className='flex flex-col p-3'>
        <Label htmlFor='msg' />
        <div className='grid w-full gap-2'>
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleOnKeyDown}
            className='min-h-0 resize-none'
            placeholder={user ? "Type your message here" : "Login"}
            disabled={isLoading || !user}
            id='msg'
          />
          <Button
            size='sm'
            className='bg-kookmin dark:text-white'
            onClick={submitMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

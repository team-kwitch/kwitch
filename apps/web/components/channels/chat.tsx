"use client"

import { useState, useEffect } from "react"

import type { User, Chat } from "@kwitch/types"

import { Label } from "@kwitch/ui/components/label"
import { Button } from "@kwitch/ui/components/button"
import { Textarea } from "@kwitch/ui/components/textarea"
import ChatItemComponent from "./chat-item"
import { Socket } from "socket.io-client"
import { SOCKET_EVENTS } from "@/const/socket"

type ChatComponentProps = {
  user: User | null
  socket: Socket | null
  channelId: string
}

export const ChatComponent = ({
  user,
  channelId,
  socket,
}: ChatComponentProps) => {
  const [currentMessage, setCurrentMessage] = useState<string>("")
  const [chats, setChats] = useState<Chat[]>([])

  const submitMessage = () => {
    if (!user || !socket || !currentMessage) return
    socket.emit(SOCKET_EVENTS.CHAT_SEND, {
      channelId: channelId,
      message: currentMessage,
    })
    setCurrentMessage("")
  }

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      setCurrentMessage((prev) => prev + "\n")
    }
  }

  useEffect(() => {
    if (!socket) return

    socket.on(SOCKET_EVENTS.CHAT_SEND, (chat: Chat) => {
      setChats((prevChats) => [chat, ...prevChats])
    })

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_SEND)
    }
  }, [socket])

  return (
    <div className='h-[calc(100%-1rem)] min-w-[20rem] max-w-[26rem] flex flex-col border-l bg-secondary mb-4 rounded-xl'>
      <h1 className='font-bold text-lg ml-4 mt-2 border-b'>Chat</h1>
      <div className='h-full flex flex-col-reverse overflow-y-auto scrollbar'>
        {chats.map((chat, index) => (
          <ChatItemComponent key={index} chat={chat} />
        ))}
      </div>
      <div className='flex flex-col p-3'>
        <Label htmlFor='msg' />
        <div className='flex flex-col w-full gap-y-3'>
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleOnKeyDown}
            className='min-h-0 resize-none'
            placeholder={user ? "Type your message here" : "Login"}
            disabled={!user}
            id='msg'
          />
          <Button size='sm' onClick={submitMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

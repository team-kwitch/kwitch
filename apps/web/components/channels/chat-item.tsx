import React from "react"
import { VideoCameraIcon } from "@heroicons/react/20/solid"
import { Chat } from "@kwitch/types"

export default function ChatItemComponent({ chat }: { chat: Chat }) {
  return (
    <div
      className={
        `${chat.username === "System" ? "text-gray-500" : ""}` +
        `w-full py-[0.2rem] px-[1.0rem]`
      }
    >
      {chat.username === "System" ? (
        <span>{chat.message}</span>
      ) : (
        <div className='w-full flex justify-start items-center break-all gap-x-1 text-sm'>
          {chat.isStreamer && (
            <VideoCameraIcon className='w-3.5 h-3.5 px-0.5 py-[0.08rem] opacity-90 rounded-sm text-white bg-red-600' />
          )}
          <span>&nbsp;{chat.username}&nbsp;</span>
          <span>{chat.message}</span>
        </div>
      )}
    </div>
  )
}

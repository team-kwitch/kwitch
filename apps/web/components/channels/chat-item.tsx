import { VideoCameraIcon } from "@heroicons/react/20/solid";
import { Chat } from "@kwitch/types";

export default function ChatItemComponent({ chat }: { chat: Chat }) {
  // TODO: add color to username

  return (
    <div className="flex items-center my-1 px-1 break-all">
      {chat.isStreamer && (
        <VideoCameraIcon className="w-4 h-4 p-0.5 rounded-sm mr-1 text-white bg-red-600"></VideoCameraIcon>
      )}
      <p>
        {!chat.isAlert && <span>{chat.username}:&nbsp;</span>}
        <span className={chat.isAlert ? "text-gray-500" : ""}>
          {chat.message}
        </span>
      </p>
    </div>
  );
}

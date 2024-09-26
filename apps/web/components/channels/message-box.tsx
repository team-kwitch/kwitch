import { VideoCameraIcon } from "@heroicons/react/20/solid";
import type { Message } from "@/types";

export default function MessageBox({ message }: { message: Message }) {
  // TODO: add color to username

  return (
    <div className="flex items-center my-1 px-1 break-all">
      {message.isBroadcaster && (
        <VideoCameraIcon className="w-4 h-4 p-0.5 rounded-sm mr-1 text-white bg-red-600"></VideoCameraIcon>
      )}
      <p>
        {!message.isAlert && <span>{message.username}:&nbsp;</span>}
        <span className={message.isAlert ? "text-gray-500" : ""}>
          {message.message}
        </span>
      </p>
    </div>
  );
}

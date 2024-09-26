import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center p-5 text-center">
      <h1 className="text-4xl font-bold trackinng-tight sm:text-6xl">
        Broadcast with Modern Web Browser.
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        Kwitch is a broadcasting platform that allows anyone to broadcast
        easily.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/channels">Go to Channel List</Link>
      </Button>

      <div className="flex divide-x-2">
        <Image
          src="https://socket.io/images/logo-dark.svg"
          alt="Socket.io"
          width={150}
          height={150}
          className="mt-8 invert dark:invert-0 px-5"
        />
        <Image
          src="https://www.gstatic.com/devrel-devsite/prod/v032f5e834ea07ceb506abc7629b7ff47ac48c72d9122b91b2cecfd4022841b1c/webrtc/images/lockup.svg"
          alt="WebRTC"
          width={400}
          height={400}
          className="mt-8 dark:invert px-5"
        />
      </div>
    </main>
  );
}

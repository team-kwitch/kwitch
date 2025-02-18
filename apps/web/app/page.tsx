import Image from "next/image"
import { Button } from "@kwitch/ui/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className='flex-1 flex flex-col justify-center items-center p-5 text-center my-20'>
      <h1 className='text-4xl font-bold trackinng-tight sm:text-6xl'>
        Streaming with Modern Web Browser.
      </h1>
      <p className='mt-4 text-lg text-gray-500'>
        A platform for easy streaming from anywhere on the modern web
      </p>
      <Button className='mt-8' asChild>
        <Link href='/channels'>Go to Channel List</Link>
      </Button>

      <div className='flex divide-x-2'>
        <Image
          src='https://socket.io/images/logo.svg'
          alt='Socket.io'
          width={150}
          height={150}
          className='mt-8 dark:invert px-5'
        />
        <Image
          src='https://www.gstatic.com/devrel-devsite/prod/v960e539c2421c080b00a083e0adb1dad169131e34dcce8c54dbf76c94616f031/webrtc/images/lockup.svg'
          alt='WebRTC'
          width={400}
          height={400}
          className='mt-8 dark:invert px-5'
        />
      </div>
    </main>
  )
}

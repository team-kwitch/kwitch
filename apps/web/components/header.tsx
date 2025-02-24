"use client"

import { usePathname } from "next/navigation"

import Logo from "./logo"
import SignInButton from "./sign-in-button"
import UserButton from "./user-button"
import { Skeleton } from "@kwitch/ui/components/skeleton"
import { Button } from "@kwitch/ui/components/button"
import Link from "next/link"
import { useAuth } from "@/provider/auth-provider"
import { ModeToggle } from "@kwitch/ui/components/mode-toggle"

export default function Header() {
  const { user, isLoading, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <header className='z-50 w-full fixed bg-background'>
      <div className='px-5 h-[4rem] flex items-center'>
        <Logo />
        <div className='flex-1' />
        <div className='flex items-center gap-x-5'>
          <ModeToggle />
          {isLoading ? (
            <>
              <div className='flex items-center space-x-4'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-10 w-[100px]' />
                </div>
              </div>
            </>
          ) : user ? (
            <>
              <UserButton user={user} signOut={signOut} />
              {pathname !== "/stream-manager" && (
                <Button asChild>
                  <Link href='/stream-manager'>Start Streaming</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <SignInButton redirect={pathname || undefined} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

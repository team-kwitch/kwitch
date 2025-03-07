"use client"

import { usePathname } from "next/navigation"

import Logo from "./Logo"
import { Button } from "@kwitch/ui/components/button"
import Link from "next/link"
import { useAuth } from "@/components/provider/AuthProvider"
import { ModeToggle } from "@kwitch/ui/components/mode-toggle"
import { User } from "@kwitch/types"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@kwitch/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@kwitch/ui/components/dropdown-menu"
import { toast } from "@kwitch/ui/hooks/use-toast"

function SignInButton({ redirect }: { redirect?: string }) {
  redirect = redirect || "/"
  return (
    <Button asChild>
      <Link href={`/sign-in?redirect=${redirect}`}>Sign In</Link>
    </Button>
  )
}

function UserButton({
  user,
  onSignOut,
}: {
  user: User
  onSignOut: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={"TODO"} alt='@shadcn' />
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSignOut()}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const { user, signOut } = useAuth()

  const pathname = usePathname()

  const onSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "You have signed out.",
        variant: "success",
      })
    } catch (err: any) {
      toast({
        title: "Failed to sign out.",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  return (
    <header className='z-50 w-full fixed bg-background'>
      <div className='px-5 h-[4rem] flex items-center'>
        <Logo />
        <div className='flex-1' />
        <div className='flex items-center gap-x-5'>
          <ModeToggle />
          {user ? (
            <>
              <UserButton user={user} onSignOut={onSignOut} />
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

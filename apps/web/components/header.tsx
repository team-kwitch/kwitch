"use client";

import { usePathname } from "next/navigation";

import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import CreateChannelButton from "./create-channel-button";
import SignInButton from "./sign-in-button";
import UserButton from "./user-button";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "./auth-provider";

export default function Header() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-background/95">
      <div className="px-5 h-14 flex items-center">
        <Logo />
        <div className="flex-1" />
        <div className="flex items-center gap-x-5">
          <ModeToggle />
          {isLoading ? (
            <>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-[100px]" />
                </div>
              </div>
            </>
          ) : user ? (
            <>
              <UserButton />
              {pathname !== "/broadcast" && <CreateChannelButton />}
            </>
          ) : (
            <>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

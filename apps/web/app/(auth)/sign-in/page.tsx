"use client";

import { useAuth } from "@/components/auth-provider";
import SignInForm from "@/components/auth/sign-in-form";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/channels");
    }
  }, [user]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="w-2/3 lg:w-1/4">
        <p className="text-3xl mb-5">Sign In</p>
        <SignInForm />
      </div>
    </div>
  );
}

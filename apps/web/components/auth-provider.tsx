"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { toast } from "./ui/use-toast";
import { api } from "@/lib/axios";


export interface SignInParams {
  username: string;
  password: string;
}

export interface SignUpParams {
  username: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (signInParams: SignInParams) => Promise<boolean>;
  signUp: (signUpParams: SignUpParams) => Promise<boolean>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/api/users/me", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const { user } = await res.data.content;
        console.log("current user: ", user);
        setUser(user);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function signIn(signInParams: SignInParams) {
    try {
      const res = await api.post("/api/auth/sign-in", signInParams, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const { user } = await res.data.content;
      setUser(user);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }

  async function signUp(signUpParams: SignUpParams) {
    try {
      await api.post("/api/auth/sign-up", signUpParams, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  function signOut() {
    api.post("/api/auth/sign-out").then(() => {
      setUser(null);
      toast({ title: "You are signed out." });
    });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}

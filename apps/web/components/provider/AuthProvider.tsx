"use client"

import { createContext, useContext, useState } from "react"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { API_ROUTES } from "@/lib/const/api"
import { User } from "@kwitch/types"
import { useRouter } from "next/navigation"
import { APICall } from "@/lib/axios"

export interface SignInParams {
  username: string
  password: string
}

export interface SignUpParams {
  username: string
  password: string
}

interface AuthContextValue {
  user: User | null
  signIn: (signInParams: SignInParams) => Promise<void>
  signUp: (signUpParams: SignUpParams) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)

  async function signIn(signInParams: SignInParams) {
    const res = await APICall<{ user: User }>({
      uri: API_ROUTES.AUTH.LOGIN.uri,
      method: API_ROUTES.AUTH.LOGIN.method,
      body: signInParams,
    })

    if (res.success) {
      setUser(res.content.user)
    } else {
      throw new Error(res.message)
    }
  }

  async function signUp(signUpParams: SignUpParams) {
    const res = await APICall({
      uri: API_ROUTES.AUTH.REGISTER.uri,
      method: API_ROUTES.AUTH.REGISTER.method,
      body: signUpParams,
    })

    if (!res.success) {
      throw new Error(res.message)
    }
  }

  async function signOut() {
    const res = await APICall({
      uri: API_ROUTES.AUTH.LOGOUT.uri,
      method: API_ROUTES.AUTH.LOGOUT.method,
    })

    if (res.success) {
      setUser(null)
    } else {
      throw new Error(res.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState } from "react"
import { API_ROUTES } from "@/lib/const/api"
import { User } from "@kwitch/types"
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
  accessToken: string | null
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
  initialAccessToken,
}: {
  children: React.ReactNode
  initialUser: User | null
  initialAccessToken: string | null
}) {
  const [auth, setAuth] = useState({
    user: initialUser,
    accessToken: initialAccessToken,
  })

  async function signIn(signInParams: SignInParams) {
    const res = await APICall<{ user: User; accessToken: string }>({
      uri: API_ROUTES.AUTH.LOGIN.uri,
      method: API_ROUTES.AUTH.LOGIN.method,
      body: signInParams,
    })

    if (res.success) {
      setAuth({
        user: res.content.user,
        accessToken: res.content.accessToken,
      })
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
      setAuth({
        user: null,
        accessToken: null,
      })
    } else {
      throw new Error(res.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        accessToken: auth.accessToken,
        signIn,
        signUp,
        signOut,
      }}
    >
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

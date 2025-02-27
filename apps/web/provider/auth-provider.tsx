"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@kwitch/ui/hooks/use-toast"
import { APICall } from "@/lib/axios"
import { API_ROUTES } from "@/const/api"
import { LOCAL_STORAGE_KEYS } from "@/const/localStorage"
import { User } from "@kwitch/types"
import { useRouter } from "next/navigation"

export interface localSignInParams {
  username: string
  password: string
}

export interface SignUpParams {
  username: string
  password: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (signInParams: localSignInParams) => Promise<boolean>
  signUp: (signUpParams: SignUpParams) => Promise<boolean>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await APICall.get(API_ROUTES.USER.ME.url)
      const user = res.data.content
      console.debug("Current user: ", user)
      setUser(user)
    } catch (err) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(signInParams: localSignInParams) {
    try {
      const res = await APICall.post(API_ROUTES.AUTH.LOGIN.url, signInParams, {
        method: API_ROUTES.AUTH.LOGIN.method,
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const accessToken = res.data.content.accessToken

      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      fetchUser()
    } catch (err: any) {
      console.error("Failed to sign in.", err.message)
      return false
    }
    return true
  }

  async function signUp(signUpParams: SignUpParams) {
    try {
      await APICall.post(API_ROUTES.AUTH.REGISTER.url, signUpParams)
    } catch (err: any) {
      console.error("Failed to sign up.", err.message)
      return false
    }
    return true
  }

  function signOut() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
    setUser(null)
    router.replace("/")
    toast({ title: "You are signed out." })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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

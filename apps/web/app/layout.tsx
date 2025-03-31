import "@kwitch/ui/styles/globals.css"
import "./index.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/provider/ThemeProvider"
import Header from "@/components/fixed/Header"
import { Toaster } from "@kwitch/ui/components/toaster"
import { AuthProvider } from "@/components/provider/AuthProvider"
import { cookies } from "next/headers"
import { User } from "@kwitch/types"
import { APICall } from "@/lib/axios"
import { API_ROUTES } from "@/lib/const/api"

export const metadata: Metadata = {
  title: "Kwitch",
  description: "Software architecture term project - Kwitch",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clientCookies = await cookies()
  const accessToken = clientCookies.get("KWT_ACC")?.value ?? null

  let user: User | null = null
  if (accessToken) {
    const res = await APICall<User>({
      uri: API_ROUTES.USER.ME.uri,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (res.success) {
      user = res.content
    }
  }

  return (
    <html lang='ko' suppressHydrationWarning>
      <body className='bg-background'>
        <AuthProvider initialUser={user} initialAccessToken={accessToken}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <div id='root' className='mt-[4rem] overflow-hidden'>
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { SocketProvider } from "@/components/socket-provider"

export const metadata: Metadata = {
  title: "Kwitch",
  description: "Software architecture term project - Kwitch",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body className='flex flex-col min-h-screen overflow-hidden'>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />

              <Header />
              {children}
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import "@kwitch/ui/styles/globals.css"
import "./index.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/provider/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@kwitch/ui/components/toaster"
import { AuthProvider } from "@/provider/auth-provider"

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
      <body className='bg-background'>
        <AuthProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />

            <Header />

            <div id='root' className='mt-[4rem] overflow-hidden'>
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

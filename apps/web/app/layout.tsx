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

function getUserLocale() {
  return 'en'
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getUserLocale();

  const defaultMetaData: Metadata = {
    title: "Kwitch - Easy Streaming Anywhere",
    description: "Kwitch is a streaming platform that helps anyone start broadcasting easily.",
    openGraph: {
      title: "Kwitch - Easy Streaming Anywhere",
      description: "Kwitch is a streaming platform that helps anyone start broadcasting easily.",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      siteName: "Kwitch",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          width: 800,
          height: 600,
        },
      ],
    },
  };

  const metaDataByLocale: Record<string, Metadata> = {
    ko: {
      title: "Kwitch - 어디서나 쉽게 스트리밍",
      description: "Kwitch는 누구나 쉽게 방송을 시작할 수 있도록 도와주는 스트리밍 플랫폼입니다.",
      openGraph: {
        title: "Kwitch - 어디서나 쉽게 스트리밍",
        description: "Kwitch는 누구나 쉽게 방송을 시작할 수 있도록 도와주는 스트리밍 플랫폼입니다.",
        url: process.env.NEXT_PUBLIC_BASE_URL,
        siteName: "Kwitch",
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
            width: 800,
            height: 600,
          },
        ],
      }
    },
    en: defaultMetaData
  };

  return metaDataByLocale[locale] || defaultMetaData;
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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const needsAuth = ["/stream-manager"]

export function middleware(request: NextRequest) {
  if (
    needsAuth.includes(request.nextUrl.pathname) &&
    !request.cookies.has("KWT_ACC")
  ) {
    return NextResponse.redirect(
      new URL("/sign-in?redirect=" + request.nextUrl.pathname, request.url),
    )
  }

  return NextResponse.next()
}

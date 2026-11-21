import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl
  const locale = pathname === "/vi" || pathname.startsWith("/vi/") ? "vi" : "en"
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-locale", locale)
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}

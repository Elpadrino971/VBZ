import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const publicRoutes = ["/", "/concerts", "/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Artist routes
  const isArtistRoute = pathname.startsWith("/dashboard")

  // User routes
  const isUserRoute = pathname.startsWith("/account")

  // Protect artist routes
  if (isArtistRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
    if (req.auth?.user?.role !== "ARTIST") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect user routes
  if (isUserRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

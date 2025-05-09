import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is not authenticated and trying to access a protected route
    if (!req.nextauth.token) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: ["/courses/:path*", "/matches/:path*", "/profile/:path*"],
} 
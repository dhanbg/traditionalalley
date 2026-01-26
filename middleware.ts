import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Skip middleware for NPS webhook (both old and new paths)
  if (nextUrl.pathname === '/api/nps-webhook' || nextUrl.pathname === '/api/webhooks/nps') {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/order", "/forum", "/wish-list"]
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // Admin routes
  const adminRoutes = ["/dashboard"]
  const isAdminRoute = adminRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Check admin access
  if (isAdminRoute) {
    if (!isLoggedIn) {
      console.log("🚫 Admin route access denied: User not logged in")
      return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // Check if user has admin role
    const userRole = req.auth?.user?.role
    const userEmail = req.auth?.user?.email
    console.log("🔍 Admin route check:", { userEmail, userRole, path: nextUrl.pathname })

    if (userRole !== "admin") {
      console.log("⛔ Admin access denied for:", userEmail, "- Role:", userRole)
      return NextResponse.redirect(new URL("/", nextUrl))
    }

    console.log("✅ Admin access granted for:", userEmail)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

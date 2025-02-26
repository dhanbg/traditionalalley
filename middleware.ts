import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();

  // Protect `/admin` routes for admin users only
  // if (isAdminRoute(req)) {
  //   const session = await auth(); // Get the session
  //   const role = (session?.sessionClaims?.metadata as { role: string })?.role; // Type assertion

  //   // Check if the user has the 'admin' role
  //   if (role !== "admin") {
  //     const url = new URL("/", req.url);
  //     return NextResponse.redirect(url); // Redirect if the user is not an admin
  //   }
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

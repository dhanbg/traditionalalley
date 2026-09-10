import { cookies } from "next/headers";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const hasSessionCookie =
      cookieStore.has("authjs.session-token") ||
      cookieStore.has("__Secure-authjs.session-token") ||
      cookieStore.has("next-auth.session-token") ||
      cookieStore.has("__Secure-next-auth.session-token");

    // Fast-path: If visitor has no session cookie, return null immediately without invoking Auth.js internals
    if (!hasSessionCookie) {
      return NextResponse.json(null, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    const session = await auth();
    return NextResponse.json(session);
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
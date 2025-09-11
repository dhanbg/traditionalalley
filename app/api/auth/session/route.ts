import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json(session)
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json(null, { status: 500 })
  }
}
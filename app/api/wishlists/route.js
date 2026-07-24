import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ data: [], meta: {} });
}

export async function POST() {
  return NextResponse.json({ message: "Wishlist feature disabled" }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Wishlist feature disabled" }, { status: 410 });
}

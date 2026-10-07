import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyStockReportEmail } from "@/utils/email";

// Ensure this endpoint is dynamically executed and not cached
export const dynamic = "force-dynamic";

/**
 * Weekly Automated Stock Report Endpoint
 * Designed for Vercel Cron Jobs (runs every Monday morning)
 * Can also be triggered manually or via webhook
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secure verification: if CRON_SECRET is set, ensure request matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("🔒 [WEEKLY-STOCK-CRON] Unauthorized cron attempt blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    console.log(`⏰ [WEEKLY-STOCK-CRON] Executing weekly stock report cron (force=${force})...`);
    const result = await sendWeeklyStockReportEmail(force);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error("❌ [WEEKLY-STOCK-CRON] Cron failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

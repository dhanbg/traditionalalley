import { NextRequest, NextResponse } from "next/server";
import { checkAndSendPostPurchaseStockAlert, sendStockAlertEmail } from "@/utils/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { products, dryRun } = body;

    console.log("🧪 [TEST-STOCK-ALERT] Received test stock alert request", { products, dryRun });

    const testProducts = products && products.length > 0 ? products : [
      {
        title: "MAYA RETRO KURTHI: LAVENDER",
        size: "XXL",
        quantity: 1
      }
    ];

    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: "Dry run successful",
        testedProducts: testProducts
      });
    }

    await checkAndSendPostPurchaseStockAlert(testProducts, "TEST-ALERT-" + Date.now());

    return NextResponse.json({
      success: true,
      message: "Stock alert triggered successfully to support@traditionalalley.com.np",
      testedProducts: testProducts
    });
  } catch (error: any) {
    console.error("❌ [TEST-STOCK-ALERT] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailConnection, sendResetPasswordOTP } from "@/utils/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // First verify email connection
    console.log("🔍 Testing email connection...");
    const connectionTest = await verifyEmailConnection();
    
    if (!connectionTest) {
      return NextResponse.json(
        { error: "Email service connection failed. Please check your SMTP configuration." },
        { status: 500 }
      );
    }

    // Send test email
    console.log(`📧 Sending test email to ${email}...`);
    const testOTP = "123456";
    const emailResult = await sendResetPasswordOTP(email, testOTP, "Test User");

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        messageId: emailResult.messageId,
        emailConnection: "✅ Connected",
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          from: process.env.SMTP_FROM
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: emailResult.error,
          emailConnection: "✅ Connected",
          message: "Email connection successful but failed to send email"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Email test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        emailConnection: "❌ Failed"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just test the connection without sending email
    console.log("🔍 Testing email connection only...");
    const connectionTest = await verifyEmailConnection();
    
    return NextResponse.json({
      emailConnection: connectionTest ? "✅ Connected" : "❌ Failed",
      smtpConfig: {
        host: process.env.SMTP_HOST || "Not configured",
        port: process.env.SMTP_PORT || "Not configured",
        user: process.env.SMTP_USER ? "✅ Set" : "❌ Not set",
        pass: process.env.SMTP_PASS ? "✅ Set" : "❌ Not set",
        from: process.env.SMTP_FROM || "Not configured"
      },
      message: connectionTest 
        ? "Gmail SMTP is configured correctly and ready to send emails!" 
        : "Gmail SMTP configuration has issues. Please check your settings."
    });

  } catch (error) {
    console.error("❌ Email connection test error:", error);
    return NextResponse.json(
      { 
        emailConnection: "❌ Failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 
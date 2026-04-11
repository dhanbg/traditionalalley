import { NextRequest, NextResponse } from "next/server";
import { fetchDataFromApi, updateData } from "@/utils/api";
import { sendResetPasswordOTP, verifyEmailConnection } from "@/utils/email";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🔐 [${requestId}] Send Reset OTP: Starting request`);
    
    const { email } = await request.json();
    
    if (!email) {
      console.log(`❌ [${requestId}] Send Reset OTP: Email is required`);
      return NextResponse.json(
        { error: "Email is required", requestId },
        { status: 400 }
      );
    }

    console.log(`📧 [${requestId}] Send Reset OTP: Looking for user with email - ${email}`);

    // Check if user exists in Strapi (get the most recent one)
    const userResponse = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${email}&sort=createdAt:desc`
    );

    if (!userResponse?.data || userResponse.data.length === 0) {
      console.log(`❌ [${requestId}] Send Reset OTP: User not found with email - ${email}`);
      return NextResponse.json(
        { error: "User not found with this email address", requestId },
        { status: 404 }
      );
    }

    const user = userResponse.data[0]; // Most recent user
    console.log(`✅ [${requestId}] Send Reset OTP: User found - ${user.firstName} ${user.lastName}`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log(`🔢 [${requestId}] Send Reset OTP: Generated OTP for ${email} (expires: ${otpExpiry.toISOString()})`);

    // Update user with reset OTP
    const updatePayload = {
      data: {
        otp: otp,
        otpExpiry: otpExpiry.toISOString(),
      }
    };

    const updatedUser = await updateData(`/api/user-data/${user.documentId}`, updatePayload);
    console.log(`✅ [${requestId}] Send Reset OTP: User updated with reset OTP`);

    // Send email with OTP using Gmail SMTP
    console.log(`📧 [${requestId}] Send Reset OTP: Attempting to send email to ${email}`);
    
    const emailResult = await sendResetPasswordOTP(
      email, 
      otp, 
      user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined
    );

    if (emailResult.success) {
      console.log(`✅ [${requestId}] Send Reset OTP: Email sent successfully with message ID: ${emailResult.messageId}`);
      
      // Production response - no OTP included for security
      return NextResponse.json({
        message: "Reset OTP sent successfully to your email address",
        requestId
      });
    } else {
      console.error(`❌ [${requestId}] Send Reset OTP: Failed to send email:`, emailResult.error);
      
      // Even if email fails, don't expose the OTP in the response
      return NextResponse.json(
        { error: "Failed to send email. Please try again later.", requestId },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Send Reset OTP error:`, error);
    return NextResponse.json(
      { error: "Failed to send reset OTP", requestId },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { fetchDataFromApi, updateData } from "@/utils/api";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🔐 [${requestId}] Verify Reset OTP: Starting request`);
    
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      console.log(`❌ [${requestId}] Verify Reset OTP: Email and OTP are required`);
      return NextResponse.json(
        { error: "Email and OTP are required", requestId },
        { status: 400 }
      );
    }

    console.log(`📧 [${requestId}] Verify Reset OTP: Processing verification for email - ${email}`);

    // Find user by email (get the most recent one)
    const userResponse = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${email}&sort=createdAt:desc`
    );

    if (!userResponse?.data || userResponse.data.length === 0) {
      console.log(`❌ [${requestId}] Verify Reset OTP: User not found with email - ${email}`);
      return NextResponse.json(
        { error: "User not found", requestId },
        { status: 404 }
      );
    }

    const user = userResponse.data[0]; // Most recent user
    console.log(`✅ [${requestId}] Verify Reset OTP: User found - ${user.firstName} ${user.lastName}`);

    // Check if OTP matches
    if (user.otp !== otp) {
      console.log(`❌ [${requestId}] Verify Reset OTP: Invalid OTP provided`);
      return NextResponse.json(
        { error: "Invalid OTP", requestId },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const otpExpiry = new Date(user.otpExpiry);
    
    if (now > otpExpiry) {
      console.log(`❌ [${requestId}] Verify Reset OTP: OTP has expired`);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one.", requestId },
        { status: 400 }
      );
    }

    console.log(`✅ [${requestId}] Verify Reset OTP: OTP verified successfully for ${email}`);

    // Generate a temporary reset token for password change
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update user with reset token and clear OTP
    const updatePayload = {
      data: {
        otp: null,
        otpExpiry: null,
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
      }
    };

    const updatedUser = await updateData(`/api/user-data/${user.documentId}`, updatePayload);
    console.log(`✅ [${requestId}] Verify Reset OTP: Reset token generated for ${email}`);

    return NextResponse.json({
      message: "OTP verified successfully. You can now reset your password.",
      resetToken: resetToken,
      requestId
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Verify Reset OTP error:`, error);
    return NextResponse.json(
      { error: "Failed to verify OTP", requestId },
      { status: 500 }
    );
  }
} 
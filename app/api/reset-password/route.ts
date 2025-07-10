import { NextRequest, NextResponse } from "next/server";
import { fetchDataFromApi, updateData } from "@/utils/api";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🔐 [${requestId}] Reset Password: Starting request`);
    
    const { email, resetToken, newPassword } = await request.json();
    
    if (!email || !resetToken || !newPassword) {
      console.log(`❌ [${requestId}] Reset Password: Missing required fields`);
      return NextResponse.json(
        { error: "Email, reset token, and new password are required", requestId },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      console.log(`❌ [${requestId}] Reset Password: Password too short`);
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", requestId },
        { status: 400 }
      );
    }

    console.log(`📧 [${requestId}] Reset Password: Processing password reset for email - ${email}`);

    // Find user by email (get the most recent one)
    const userResponse = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${email}&sort=createdAt:desc`
    );

    if (!userResponse?.data || userResponse.data.length === 0) {
      console.log(`❌ [${requestId}] Reset Password: User not found with email - ${email}`);
      return NextResponse.json(
        { error: "User not found", requestId },
        { status: 404 }
      );
    }

    const user = userResponse.data[0]; // Most recent user
    console.log(`✅ [${requestId}] Reset Password: User found - ${user.firstName} ${user.lastName}`);

    // Check if reset token matches
    if (user.resetToken !== resetToken) {
      console.log(`❌ [${requestId}] Reset Password: Invalid reset token`);
      return NextResponse.json(
        { error: "Invalid or expired reset token", requestId },
        { status: 400 }
      );
    }

    // Check if reset token has expired
    const now = new Date();
    const resetTokenExpiry = new Date(user.resetTokenExpiry);
    
    if (now > resetTokenExpiry) {
      console.log(`❌ [${requestId}] Reset Password: Reset token has expired`);
      return NextResponse.json(
        { error: "Reset token has expired. Please start the password reset process again.", requestId },
        { status: 400 }
      );
    }

    console.log(`✅ [${requestId}] Reset Password: Reset token verified successfully for ${email}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`🔒 [${requestId}] Reset Password: Password hashed`);

    // Update user with new password and clear reset token
    const updatePayload = {
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    };

    const updatedUser = await updateData(`/api/user-data/${user.documentId}`, updatePayload);
    console.log(`✅ [${requestId}] Reset Password: Password updated successfully for ${email}`);

    return NextResponse.json({
      message: "Password reset successfully. You can now login with your new password.",
      requestId
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Reset Password error:`, error);
    return NextResponse.json(
      { error: "Failed to reset password", requestId },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { fetchDataFromApi, updateData, createData } from "@/utils/api";
import bcrypt from "bcryptjs";

// Enhanced password validation function
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters long");
  }
  
  // Complexity checks
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  // Common password checks
  const commonPasswords = [
    "password", "123456", "123456789", "12345678", "12345", "1234567",
    "password123", "admin", "qwerty", "abc123", "letmein", "monkey",
    "password1", "123123", "welcome", "login", "admin123", "iloveyou",
    "princess", "rockyou", "1234567890", "football", "baseball", "dragon"
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a more secure password");
  }
  
  // Sequential characters check
  if (/123456|abcdef|qwerty/i.test(password)) {
    errors.push("Password cannot contain sequential characters");
  }
  
  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot contain more than 2 repeated characters in a row");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🚀 [${requestId}] Verify OTP: Starting request`);
    
    const body = await request.json();
    const { email, otp, password, confirmPassword } = body;
    
    console.log(`📧 [${requestId}] Verify OTP: Email received: ${email}`);
    console.log(`🔢 [${requestId}] Verify OTP: OTP received: ${otp}`);
    
    // Basic validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }
    
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: "Password and confirm password are required" },
        { status: 400 }
      );
    }
    
    // Password match validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }
    
    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: "Password does not meet security requirements",
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }
    
    // Find user by email
    const searchUrl = `/api/user-data?filters[email][$containsi]=${email}&publicationState=preview`;
    console.log(`🔍 [${requestId}] Verify OTP: Searching for user with URL: ${searchUrl}`);
    
    const userResponse = await fetchDataFromApi(searchUrl);
    
    console.log(`📊 [${requestId}] Verify OTP: User search response:`, JSON.stringify(userResponse, null, 2));
    
    if (!userResponse?.data || userResponse.data.length === 0) {
      console.log(`❌ [${requestId}] Verify OTP: No user found for email: ${email}`);
      return NextResponse.json(
        { error: "User not found. Please request a new OTP." },
        { status: 404 }
      );
    }
    
    const user = userResponse.data[0];
    console.log(`👤 [${requestId}] Verify OTP: User found:`, JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hasOtp: !!user.otp,
      otpValue: user.otp,
      otpExpiry: user.otpExpiry,
      isEmailVerified: user.isEmailVerified
    }, null, 2));
    
    // Check if user is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 409 }
      );
    }
    
    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      console.log(`❌ [${requestId}] Verify OTP: OTP mismatch. Expected: ${user.otp}, Received: ${otp}`);
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }
    
    // Check OTP expiry
    const otpExpiry = new Date(user.otpExpiry);
    const now = new Date();
    
    console.log(`⏰ [${requestId}] Verify OTP: OTP expiry check - Now: ${now.toISOString()}, Expiry: ${otpExpiry.toISOString()}, Valid: ${now <= otpExpiry}`);
    
    if (now > otpExpiry) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }
    
    console.log(`✅ [${requestId}] Verify OTP: OTP verified for ${email}`);
    
    // After OTP is verified and you have the plain password from the user:
    const hashedPassword = await bcrypt.hash(password, 10);

    const updateUserData = {
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        otp: null,
        otpExpiry: null,
      }
    };

    const updatedUser = await updateData(`/api/user-data/${user.documentId}`, updateUserData);
    console.log(`🔄 [${requestId}] Verify OTP: User updated with password and verified status`);

    // Create user bag if it doesn't exist
    if (!user.user_bag) {
      const userBagData = {
        data: {
          Name: `${user.firstName} ${user.lastName}`.trim(),
          user_datum: user.documentId
        }
      };
      try {
        const userBag = await createData("/api/user-bags", userBagData);
        console.log(`🛍️ [${requestId}] Verify OTP: User bag created with ID: ${userBag?.data?.id}`);
      } catch (error) {
        console.error(`❌ [${requestId}] User bag creation failed:`, error.detail || error);
      }
    } else {
      console.log(`ℹ️ [${requestId}] User already has a user bag, skipping creation.`);
    }

    console.log(`🎉 [${requestId}] Verify OTP: Registration completed for ${email}`);

    return NextResponse.json({
      message: "Email verified and registration completed successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
      },
      requestId
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Verify OTP: Error during request:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createData, fetchDataFromApi } from "@/utils/api";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email with proper error handling and timeout
const sendOTPEmail = async (email: string, otp: string, firstName: string) => {
  const transporter = createTransporter();
  
  // Verify connection first
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    throw new Error('Email service is currently unavailable. Please try again later.');
  }
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Traditional Alley - Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Traditional Alley</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Email Verification</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${firstName}!</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with Traditional Alley. To complete your registration, please verify your email address using the code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #3498db; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; display: inline-block;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes for security reasons.
          </p>
        </div>
        
        
        <div style="text-align: center; color: #7f8c8d; font-size: 12px;">
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>© 2024 Traditional Alley. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // Send email with timeout
  const emailPromise = transporter.sendMail(mailOptions);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000);
  });
  
  try {
    const result = await Promise.race([emailPromise, timeoutPromise]) as any;
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🚀 [${requestId}] Send OTP: Starting request`);
    
    // Parse JSON with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] Send OTP: JSON parsing error:`, parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body", requestId },
        { status: 400 }
      );
    }
    
    const { email, firstName, lastName } = body;
    console.log(`📝 [${requestId}] Send OTP: Parsed data - email: ${email}, firstName: ${firstName}, lastName: ${lastName}`);
    
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }
    
    // Check if user already exists and is verified
    const existingUser = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${encodeURIComponent(email)}`
    );
    
    if (existingUser?.data && existingUser.data.length > 0) {
      const user = existingUser.data[0];
      if (user.isEmailVerified) {
        return NextResponse.json(
          { error: "User with this email already exists and is verified" },
          { status: 409 }
        );
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes
    
    console.log(`🔢 [${requestId}] Send OTP: Generated OTP for ${email}`);
    
    // Store OTP in database (create or update user record)
    let userData;
    if (existingUser?.data && existingUser.data.length > 0) {
      // Update existing user with new OTP and name data
      const userDocumentId = existingUser.data[0].documentId;
      userData = {
        data: {
          firstName: firstName,
          lastName: lastName,
          otp: otp,
          otpExpiry: otpExpiry.toISOString(),
        }
      };
      
      // Update user record
      const { updateData } = await import("@/utils/api");
      await updateData(`/api/user-data/${userDocumentId}`, userData);
      console.log(`🔄 [${requestId}] Send OTP: Updated existing user with new OTP`);
    } else {
      // Create new user record with OTP (without password yet)
      userData = {
        data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          otp: otp,
          otpExpiry: otpExpiry.toISOString(),
          isEmailVerified: false,
          authUserId: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }
      };
      
      await createData("/api/user-data", userData);
      console.log(`✨ [${requestId}] Send OTP: Created new user record with OTP`);
    }
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName);
      console.log(`📧 [${requestId}] Send OTP: Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`❌ [${requestId}] Send OTP: Email sending failed:`, emailError);
      return NextResponse.json(
        { 
          error: emailError.message || "Failed to send verification email. Please try again.",
          requestId 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "OTP sent successfully",
      email: email,
      expiresIn: "10 minutes",
      requestId
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] Send OTP error:`, error);
    return NextResponse.json(
      { 
        error: "Failed to send OTP", 
        detail: error.message,
        requestId 
      },
      { status: 500 }
    );
  }
}
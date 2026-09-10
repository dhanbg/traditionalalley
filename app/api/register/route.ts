import { NextRequest, NextResponse } from "next/server";
import { createData, fetchDataFromApi } from "@/utils/api";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🚀 [${requestId}] Registration: Starting request`);
    
    const body = await request.json();
    console.log(`📝 [${requestId}] Registration: Request body:`, { email: body.email, hasPassword: !!body.password });
    
    const { email, password, confirmPassword } = body;
    
    // Validation
    if (!email || !password || !confirmPassword) {
      console.log(`❌ [${requestId}] Registration: Missing required fields`);
      return NextResponse.json(
        { error: "Email, password, and confirm password are required" },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      console.log(`❌ [${requestId}] Registration: Passwords do not match`);
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      console.log(`❌ [${requestId}] Registration: Password too short`);
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }
    
    console.log(`🔍 [${requestId}] Registration: Checking if user exists`);
    
    // Check if user already exists
    const existingUser = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${encodeURIComponent(email)}`
    );
    
    console.log(`🔍 [${requestId}] Registration: Existing user check result:`, existingUser?.data?.length || 0);
    
    if (existingUser?.data && existingUser.data.length > 0) {
      console.log(`❌ [${requestId}] Registration: User already exists`);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    console.log(`🔐 [${requestId}] Registration: Hashing password`);
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`👤 [${requestId}] Registration: Creating user in Strapi`);
    
    // Create user in Strapi
    const userData = {
      data: {
        firstName: email.split('@')[0], // Use email prefix as default first name
        lastName: "",
        authUserId: `credentials_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        avatar: "",
        email: email,
        password: hashedPassword,
      }
    };
    
    const newUser = await createData("/api/user-data", userData);
    console.log(`✨ [${requestId}] Registration: User created in Strapi with ID: ${newUser?.data?.id}`);
    
    if (newUser?.data?.id) {
      console.log(`🛍️ [${requestId}] Registration: Creating user bag`);
      
      // Create user bag for the new user
      const userBagData = {
        data: {
          Name: userData.data.firstName,
          user_datum: newUser.data.id
        }
      };
      
      const userBag = await createData("/api/user-bags", userBagData);
      console.log(`✅ [${requestId}] Registration: User bag created with ID: ${userBag?.data?.id} - Complete setup for ${email}`);
    }
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = newUser.data;
    
    console.log(`🎉 [${requestId}] Registration: Success for ${email}`);
    
    return NextResponse.json({
      message: "User registered successfully",
      user: userWithoutPassword,
      requestId
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] Registration error:`, error.message);
    return NextResponse.json(
      { 
        error: "Failed to register user", 
        detail: error.message,
        requestId 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createData, fetchDataFromApi } from "@/utils/api";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🚀 [${requestId}] User management: Starting request`);
    
    const session = await auth();
    
    if (!session?.user) {
      console.log(`❌ [${requestId}] User management: No session found`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    console.log(`🔍 [${requestId}] User management: Checking if user exists - ${user.email} (ID: ${user.id})`);
    
    // Check if user already exists in Strapi
    const existingUser = await fetchDataFromApi(
      `/api/user-datas?filters[authUserId][$eq]=${user.id}`
    );

    if (existingUser?.data && existingUser.data.length > 0) {
      console.log(`✅ [${requestId}] User management: User already exists - ${user.email} (no creation needed)`);
      return NextResponse.json({ 
        message: "User already exists", 
        user: existingUser.data[0],
        created: false,
        requestId
      });
    }

    console.log(`🆕 [${requestId}] User management: User not found, creating new user - ${user.email}`);
    
    // Create new user in Strapi
    const userData = {
      data: {
        firstName: user.name?.split(' ')[0] || "User",
        lastName: user.name?.split(' ').slice(1).join(' ') || "",
        authUserId: user.id,
        avatar: user.image || "",
        email: user.email || "",
      }
    };

    const newUser = await createData("/api/user-datas", userData);
    console.log(`✨ [${requestId}] User management: User created in Strapi with ID: ${newUser?.data?.id}`);
    
    if (newUser?.data?.id) {
      // Create user bag for the new user
      const userBagData = {
        data: {
          Name: `${userData.data.firstName} ${userData.data.lastName}`.trim(),
          user_datum: newUser.data.id
        }
      };
      
      const userBag = await createData("/api/user-bags", userBagData);
      console.log(`✅ [${requestId}] User management: User bag created with ID: ${userBag?.data?.id} - Complete setup for ${user.email}`);
    }

    return NextResponse.json({ 
      message: "User created successfully", 
      user: newUser.data,
      created: true,
      requestId
    });

  } catch (error) {
    console.error(`❌ [${requestId}] User management error:`, error);
    return NextResponse.json(
      { error: "Failed to manage user", requestId },
      { status: 500 }
    );
  }
} 
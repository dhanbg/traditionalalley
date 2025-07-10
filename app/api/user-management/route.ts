import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createData, fetchDataFromApi, updateData } from "@/utils/api";

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
    
    // Check if user already exists in Strapi by authUserId
    const existingUser = await fetchDataFromApi(
      `/api/user-data?filters[authUserId][$eq]=${user.id}`
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

    // If not found by authUserId, check if user exists by email (for users created during registration)
    const existingUserByEmail = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${user.email}`
    );

    if (existingUserByEmail?.data && existingUserByEmail.data.length > 0) {
      console.log(`🔄 [${requestId}] User management: User found by email but with different authUserId - updating authUserId`);
      const userData = existingUserByEmail.data[0];
      
      // Update the authUserId to match the current session
      try {
        const updatePayload = {
          data: {
            authUserId: user.id
          }
        };
        
        const updatedUser = await updateData(`/api/user-data/${userData.documentId}`, updatePayload);
        console.log(`✅ [${requestId}] User management: Updated authUserId for ${user.email}`);
        
        return NextResponse.json({ 
          message: "User authUserId updated", 
          user: updatedUser.data,
          created: false,
          updated: true,
          requestId
        });
      } catch (updateError) {
        console.error(`❌ [${requestId}] User management: Error updating authUserId:`, updateError);
        // Continue to user creation if update fails
      }
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

    const newUser = await createData("/api/user-data", userData);
    console.log(`✨ [${requestId}] User management: User created in Strapi with ID: ${newUser?.data?.id}`);
    
    if (newUser?.data?.id) {
      // Create user bag for the new user
      const userBagData = {
        data: {
          Name: `${userData.data.firstName} ${userData.data.lastName}`.trim(),
          user_datum: newUser.data.documentId
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
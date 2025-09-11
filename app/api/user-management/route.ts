import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createData, fetchDataFromApi, updateData } from "@/utils/api";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const debugLogs: string[] = [];
  
  try {
    debugLogs.push(`[${new Date().toISOString()}] Starting user management process`);
    console.log(`🚀 [${requestId}] User management: Starting request`);
    
    const session = await auth();
    debugLogs.push(`[${new Date().toISOString()}] Session retrieved: ${session ? 'Found' : 'Not found'}`);
    
    if (!session?.user) {
      debugLogs.push(`[${new Date().toISOString()}] Authentication failed - no session or user`);
      console.log(`❌ [${requestId}] User management: No session found`);
      console.log('User Management Debug:', debugLogs.join('\n'));
      return NextResponse.json({ error: "Unauthorized", debugLogs }, { status: 401 });
    }

    const user = session.user;
    debugLogs.push(`[${new Date().toISOString()}] User data extracted - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    console.log(`🔍 [${requestId}] User management: Checking if user exists - ${user.email} (ID: ${user.id})`);
    
    debugLogs.push(`[${new Date().toISOString()}] Checking for existing user by authUserId: ${user.id}`);
    
    // Check if user already exists in Strapi by authUserId
    const existingUser = await fetchDataFromApi(
      `/api/user-data?filters[authUserId][$eq]=${user.id}`
    );
    debugLogs.push(`[${new Date().toISOString()}] AuthUserId search result: ${existingUser?.data?.length || 0} users found`);

    if (existingUser?.data && existingUser.data.length > 0) {
      debugLogs.push(`[${new Date().toISOString()}] User exists by authUserId, returning existing user`);
      console.log(`✅ [${requestId}] User management: User already exists - ${user.email} (no creation needed)`);
      console.log('User Management Debug:', debugLogs.join('\n'));
      return NextResponse.json({ 
        message: "User already exists", 
        user: existingUser.data[0],
        created: false,
        requestId,
        debugLogs
      });
    }

    debugLogs.push(`[${new Date().toISOString()}] Checking for existing user by email: ${user.email}`);
    
    // If not found by authUserId, check if user exists by email (for users created during registration)
    const existingUserByEmail = await fetchDataFromApi(
      `/api/user-data?filters[email][$eq]=${user.email}`
    );
    debugLogs.push(`[${new Date().toISOString()}] Email search result: ${existingUserByEmail?.data?.length || 0} users found`);

    if (existingUserByEmail?.data && existingUserByEmail.data.length > 0) {
      debugLogs.push(`[${new Date().toISOString()}] User exists by email, updating with OAuth info`);
      console.log(`🔄 [${requestId}] User management: User found by email but with different authUserId - updating authUserId`);
      const userData = existingUserByEmail.data[0];
      debugLogs.push(`[${new Date().toISOString()}] Updating user ID: ${userData.documentId}`);
      
      // Update the authUserId to match the current session
      try {
        const updatePayload = {
          data: {
            authUserId: user.id
          }
        };
        
        const updatedUser = await updateData(`/api/user-data/${userData.documentId}`, updatePayload);
        debugLogs.push(`[${new Date().toISOString()}] User updated successfully`);
        console.log(`✅ [${requestId}] User management: Updated authUserId for ${user.email}`);
        console.log('User Management Debug:', debugLogs.join('\n'));
        
        return NextResponse.json({ 
          message: "User authUserId updated", 
          user: updatedUser.data,
          created: false,
          updated: true,
          requestId,
          debugLogs
        });
      } catch (updateError) {
        debugLogs.push(`[${new Date().toISOString()}] Error updating user: ${updateError}`);
        console.error(`❌ [${requestId}] User management: Error updating authUserId:`, updateError);
        // Continue to user creation if update fails
      }
    }

    debugLogs.push(`[${new Date().toISOString()}] Creating new user`);
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
    
    debugLogs.push(`[${new Date().toISOString()}] User data prepared: ${JSON.stringify(userData)}`);

    const newUser = await createData("/api/user-data", userData);
    debugLogs.push(`[${new Date().toISOString()}] User created with ID: ${newUser?.data?.id}`);
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

    debugLogs.push(`[${new Date().toISOString()}] User creation process completed successfully`);
    console.log('User Management Debug:', debugLogs.join('\n'));
    
    return NextResponse.json({ 
      message: "User created successfully", 
      user: newUser.data,
      created: true,
      requestId,
      debugLogs
    });

  } catch (error) {
    debugLogs.push(`[${new Date().toISOString()}] Error occurred: ${error}`);
    console.error(`❌ [${requestId}] User management error:`, error);
    console.log('User Management Debug:', debugLogs.join('\n'));
    return NextResponse.json(
      { error: "Failed to manage user", requestId, debugLogs },
      { status: 500 }
    );
  }
}
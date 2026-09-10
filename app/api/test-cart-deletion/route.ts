import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { getStrapiInternalUrl } from '@/utils/urls';

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function fetchDataFromApi(endpoint: string) {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  };
  
  const res = await fetch(`${getStrapiInternalUrl()}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.statusText}`);
  }
  return res.json();
}

async function deleteData(endpoint: string) {
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  };
  
  const res = await fetch(`${getStrapiInternalUrl()}${endpoint}`, options);
  
  let responseText;
  try {
    responseText = await res.text();
  } catch (textError) {
    // Could not get response text
  }
  
  let responseData;
  try {
    if (responseText && responseText.length > 0) {
      responseData = JSON.parse(responseText);
    }
  } catch (parseError) {
    // Response is not JSON
  }
  
  if (!res.ok) {
    const error = new Error(`Delete failed: ${res.statusText}`);
    (error as any).status = res.status;
    (error as any).detail = responseData || responseText;
    (error as any).url = `${getStrapiInternalUrl()}${endpoint}`;
    throw error;
  }
  
  return responseData || { success: true };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const results: string[] = [];
    
    results.push(`🧪 Testing cart deletion for user: ${session.user.email} (ID: ${session.user.id})`);
    
    // Get current user data
    const currentUserData = await fetchDataFromApi(
      `/api/user-data?filters[authUserId][$eq]=${session.user.id}&populate=*`
    );
    
    if (!currentUserData?.data || currentUserData.data.length === 0) {
      results.push('❌ User data not found in backend');
      return NextResponse.json({ results });
    }
    
    const userData = currentUserData.data[0];
    const userDocumentId = userData.documentId || userData.attributes?.documentId;
    results.push(`📋 User documentId: ${userDocumentId}`);
    
    // Get cart items for this user
    const cartResponse = await fetchDataFromApi(
      `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
    );
    
    results.push(`🛒 Found ${cartResponse?.data?.length || 0} cart items in backend`);
    
    if (cartResponse?.data?.length > 0) {
      // Show cart items details
      cartResponse.data.forEach((item: any, index: number) => {
        results.push(`Cart Item ${index + 1}: ${item.product?.title || 'Unknown'} (ID: ${item.id}, DocumentId: ${item.documentId})`);
      });
      
      // Try to delete the first cart item as a test
      const firstCartItem = cartResponse.data[0];
      results.push(`🧪 Testing deletion of: ${firstCartItem.product?.title || 'Unknown Product'}`);
      
      try {
        const deleteUrl = `/api/carts/${firstCartItem.documentId}`;
        results.push(`🔥 Making DELETE request to: ${deleteUrl}`);
        
        const deleteResponse = await deleteData(deleteUrl);
        results.push(`✅ Delete response: ${JSON.stringify(deleteResponse)}`);
        
        // Verify deletion
        const verifyResponse = await fetchDataFromApi(
          `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
        );
        results.push(`🔍 After deletion - remaining items: ${verifyResponse?.data?.length || 0}`);
        
        if (verifyResponse?.data?.length < cartResponse.data.length) {
          results.push('🎉 Cart deletion test PASSED! Item was successfully deleted.');
        } else {
          results.push('⚠️ Cart deletion test FAILED! Item was not deleted.');
        }
        
      } catch (deleteError: any) {
        results.push(`❌ Delete request failed: ${deleteError.message}`);
        results.push(`❌ Error status: ${deleteError.status}`);
        results.push(`❌ Error detail: ${JSON.stringify(deleteError.detail)}`);
        results.push(`❌ Error URL: ${deleteError.url}`);
      }
    } else {
      results.push('ℹ️ No cart items found for testing. Please add some items to cart first.');
    }
    
    return NextResponse.json({ results });
    
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message,
      results: [`❌ Test function error: ${error.message}`]
    }, { status: 500 });
  }
}

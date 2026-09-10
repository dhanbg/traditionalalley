// Standalone cart deletion debug script
// Run this with: node debug-cart.js

// Load environment variables
require('dotenv').config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

console.log('🔧 Cart Deletion Debug Script');
console.log('API_URL:', API_URL);
console.log('Token present:', STRAPI_API_TOKEN ? 'Yes' : 'No');

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN not found in environment variables');
  console.log('Please check your .env file contains STRAPI_API_TOKEN=your_token_here');
  process.exit(1);
}

async function testCartDeletion() {
  try {
    // First, let's get all cart items
    console.log('\n📋 Step 1: Fetching all cart items...');
    const cartResponse = await fetch(`${API_URL}/api/carts?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Cart fetch status:', cartResponse.status);
    
    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.error('❌ Failed to fetch carts:', errorText);
      return;
    }
    
    const cartData = await cartResponse.json();
    console.log('📦 Found cart items:', cartData.data?.length || 0);
    
    if (cartData.data && cartData.data.length > 0) {
      // Show first cart item details
      const firstItem = cartData.data[0];
      console.log('\n🧪 First cart item details:');
      console.log('- ID:', firstItem.id);
      console.log('- DocumentId:', firstItem.documentId);
      console.log('- Product:', firstItem.product?.title || 'Unknown');
      console.log('- User:', firstItem.user_datum?.email || firstItem.user_datum?.id || 'Unknown');
      
      // Try to delete this item
      console.log('\n🔥 Step 2: Testing deletion...');
      const deleteUrl = `${API_URL}/api/carts/${firstItem.documentId}`;
      console.log('DELETE URL:', deleteUrl);
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete status:', deleteResponse.status);
      console.log('Delete statusText:', deleteResponse.statusText);
      
      const deleteText = await deleteResponse.text();
      console.log('Delete response:', deleteText);
      
      if (deleteResponse.ok) {
        console.log('✅ Deletion successful!');
        
        // Verify deletion
        console.log('\n🔍 Step 3: Verifying deletion...');
        const verifyResponse = await fetch(`${API_URL}/api/carts?populate=*`, {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        const verifyData = await verifyResponse.json();
        console.log('📊 Remaining items after deletion:', verifyData.data?.length || 0);
        
        if (verifyData.data?.length < cartData.data.length) {
          console.log('🎉 CART DELETION TEST PASSED!');
        } else {
          console.log('⚠️ CART DELETION TEST FAILED - Item still exists');
        }
      } else {
        console.log('❌ Deletion failed:', deleteText);
      }
    } else {
      console.log('ℹ️ No cart items found to test with');
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the test
testCartDeletion();

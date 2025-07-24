// Test frontend cart deletion with actual purchased product data
// This simulates what happens after a payment

require('dotenv').config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

console.log('🧪 Frontend Cart Deletion Test');
console.log('API_URL:', API_URL);
console.log('Token present:', STRAPI_API_TOKEN ? 'Yes' : 'No');

async function testFrontendCartDeletion() {
  try {
    // Step 1: Get current cart items
    console.log('\n📋 Step 1: Fetching current cart items...');
    const cartResponse = await fetch(`${API_URL}/api/carts?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const cartData = await cartResponse.json();
    console.log(`📦 Found ${cartData.data.length} cart items`);
    
    if (cartData.data.length === 0) {
      console.log('❌ No cart items found to test deletion');
      return;
    }
    
    // Step 2: Get user data for the cart items
    console.log('\n👤 Step 2: Getting user data...');
    const userResponse = await fetch(`${API_URL}/api/user-data?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    console.log(`👥 Found ${userData.data.length} users`);
    
    // Step 3: Simulate purchased products data structure
    const firstCartItem = cartData.data[0];
    console.log('\n🛒 Step 3: Simulating purchased product data...');
    console.log('First cart item structure:', JSON.stringify(firstCartItem, null, 2));
    
    // Create purchased products array that matches what payment callback would send
    const purchasedProducts = [{
      documentId: firstCartItem.product?.documentId,
      productId: firstCartItem.product?.documentId,
      title: firstCartItem.product?.title,
      size: firstCartItem.size,
      selectedSize: firstCartItem.size,
      variantId: firstCartItem.variantInfo?.variantId,
      quantity: firstCartItem.quantity
    }];
    
    console.log('Simulated purchased products:', JSON.stringify(purchasedProducts, null, 2));
    
    // Step 4: Test the matching logic that clearPurchasedItemsFromCart uses
    console.log('\n🔍 Step 4: Testing matching logic...');
    
    const userDocumentId = userData.data.find(u => u.authUserId)?.documentId;
    console.log('User documentId:', userDocumentId);
    
    if (!userDocumentId) {
      console.log('❌ No user documentId found');
      return;
    }
    
    // Get cart items for specific user (like clearPurchasedItemsFromCart does)
    const userCartResponse = await fetch(
      `${API_URL}/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const userCartData = await userCartResponse.json();
    console.log(`🎯 Found ${userCartData.data.length} cart items for user ${userDocumentId}`);
    
    // Test matching logic
    const cartItemsToDelete = userCartData.data.filter(cartItem => {
      const cartProductId = cartItem.product?.documentId;
      const cartItemSize = cartItem.size;
      const cartItemVariantId = cartItem.variantInfo?.variantId;
      
      console.log(`\n🔍 Checking cart item:`, {
        cartItemId: cartItem.id,
        cartDocumentId: cartItem.documentId,
        cartProductId: cartProductId,
        cartItemSize: cartItemSize,
        cartItemVariantId: cartItemVariantId,
        cartProductTitle: cartItem.product?.title || 'Unknown'
      });
      
      const isMatch = purchasedProducts.some(purchasedProduct => {
        const productMatch = purchasedProduct.documentId === cartProductId;
        const sizeMatch = !cartItemSize || !purchasedProduct.selectedSize || cartItemSize === purchasedProduct.selectedSize;
        const variantMatch = !cartItemVariantId || !purchasedProduct.variantId || cartItemVariantId === purchasedProduct.variantId;
        
        console.log(`  📊 Matching against purchased:`, {
          purchasedDocumentId: purchasedProduct.documentId,
          purchasedSize: purchasedProduct.selectedSize,
          purchasedVariant: purchasedProduct.variantId,
          productMatch: productMatch,
          sizeMatch: sizeMatch,
          variantMatch: variantMatch,
          fullMatch: productMatch && sizeMatch && variantMatch
        });
        
        return productMatch && sizeMatch && variantMatch;
      });
      
      return isMatch;
    });
    
    console.log(`\n🎯 Found ${cartItemsToDelete.length} items to delete`);
    
    if (cartItemsToDelete.length > 0) {
      console.log('\n🗑️ Step 5: Testing actual deletion...');
      const itemToDelete = cartItemsToDelete[0];
      
      console.log(`Deleting cart item: ${itemToDelete.documentId}`);
      const deleteResponse = await fetch(`${API_URL}/api/carts/${itemToDelete.documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Delete status: ${deleteResponse.status}`);
      
      if (deleteResponse.ok) {
        console.log('✅ Deletion successful!');
        
        // Verify deletion
        const verifyResponse = await fetch(
          `${API_URL}/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`,
          {
            headers: {
              'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const verifyData = await verifyResponse.json();
        console.log(`✅ Verification: ${verifyData.data.length} items remaining`);
      } else {
        console.log('❌ Deletion failed');
        const errorText = await deleteResponse.text();
        console.log('Error:', errorText);
      }
    } else {
      console.log('❌ No matching items found for deletion');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFrontendCartDeletion().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});

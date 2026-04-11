// Check recent payments and their orderData
require('dotenv').config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function checkRecentPayments() {
  try {
    console.log('🔍 Checking recent payments...');
    
    // Get user data first
    const userResponse = await fetch(`${API_URL}/api/user-data?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    console.log(`Found ${userData.data.length} users`);
    
    // Find user with recent payments
    for (const user of userData.data) {
      if (user.userBag && user.userBag.payments && user.userBag.payments.length > 0) {
        console.log(`\n👤 User: ${user.email} (${user.authUserId})`);
        console.log(`📦 Cart items: ${user.userBag.cartProducts?.length || 0}`);
        console.log(`💳 Payments: ${user.userBag.payments.length}`);
        
        // Show recent payments
        const recentPayments = user.userBag.payments.slice(-3);
        recentPayments.forEach((payment, index) => {
          console.log(`\n💳 Payment ${index + 1}:`);
          console.log(`  Status: ${payment.status}`);
          console.log(`  Provider: ${payment.provider}`);
          console.log(`  Amount: ${payment.amount}`);
          console.log(`  Timestamp: ${payment.timestamp}`);
          console.log(`  MerchantTxnId: ${payment.merchantTxnId}`);
          console.log(`  Has orderData: ${payment.orderData ? 'Yes' : 'No'}`);
          
          if (payment.orderData && payment.orderData.products) {
            console.log(`  Products in orderData: ${payment.orderData.products.length}`);
            payment.orderData.products.forEach((product, pIndex) => {
              console.log(`    Product ${pIndex + 1}: ${product.title} (${product.documentId}) - Size: ${product.selectedSize || product.size || 'N/A'}`);
            });
          }
        });
        
        // Show current cart items
        if (user.userBag.cartProducts && user.userBag.cartProducts.length > 0) {
          console.log(`\n🛒 Current cart items:`);
          user.userBag.cartProducts.forEach((item, index) => {
            console.log(`  Item ${index + 1}: ${item.title} (${item.documentId}) - Size: ${item.size || 'N/A'} - Qty: ${item.quantity}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecentPayments();

const API_URL = "https://admin.traditionalalley.com.np";
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";

async function checkRecentPayments() {
  try {
    console.log('🔍 Checking production recent payments...');
    
    // Get user-bags directly which is more reliable
    const response = await fetch(`${API_URL}/api/user-bags?populate=*&sort=updatedAt:desc&pagination[pageSize]=10`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (!data || !data.data) {
      console.log("No data returned:", data);
      return;
    }
    
    console.log(`Found ${data.data.length} user bags`);
    
    for (const bag of data.data) {
      console.log(`\n💼 User Bag DocumentID: ${bag.documentId} | UpdatedAt: ${bag.updatedAt}`);
      console.log(`👤 User email: ${bag.user_datum?.email || 'N/A'}`);
      const orders = bag.user_orders || {};
      const payments = orders.payments || [];
      console.log(`💳 Payments: ${payments.length}`);
      
      payments.forEach((payment, index) => {
        console.log(`  💳 Payment ${index + 1}:`);
        console.log(`    Status: ${payment.status}`);
        console.log(`    Provider: ${payment.provider}`);
        console.log(`    Amount: ${payment.amount}`);
        console.log(`    Timestamp: ${payment.timestamp}`);
        console.log(`    MerchantTxnId: ${payment.merchantTxnId}`);
        console.log(`    Has orderData: ${payment.orderData ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecentPayments();

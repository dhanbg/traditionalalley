const API_URL = "https://admin.traditionalalley.com.np";
const STRAPI_API_TOKEN = "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

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

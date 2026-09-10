const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
const TXN_ID = "TXN-1781497304430-9wv4kjwix";

async function run() {
  try {
    const url = `${STRAPI_URL}/api/user-bags?populate=*&pagination[pageSize]=100&sort=updatedAt:desc`;
    console.log(`Querying: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    const bags = data?.data || [];
    
    console.log(`Found ${bags.length} bags in response.`);
    let found = false;
    for (const bag of bags) {
      if (bag.documentId === 'rbhex4uk9lk50dk521f53kuo') {
        console.log(`Found bag rbhex4uk9lk50dk521f53kuo in the list!`);
        console.log(`user_orders:`, JSON.stringify(bag.user_orders, null, 2));
      }
      
      const orders = bag.user_orders;
      if (!orders?.payments) continue;
      
      for (const payment of orders.payments) {
        if (payment.merchantTxnId === TXN_ID) {
          console.log(`✅ MATCH FOUND: Bag ${bag.documentId} has merchantTxnId ${TXN_ID}`);
          found = true;
        }
      }
    }
    
    if (!found) {
      console.log(`❌ Match NOT found in the 100 bags fetched.`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

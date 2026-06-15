const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";
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

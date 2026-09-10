const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
const BAG_ID = "ei7z170bfkv6ag9h2gwe0uu7";

async function run() {
  try {
    const url = `${STRAPI_URL}/api/user-bags/${BAG_ID}?populate=*`;
    console.log(`Fetching from ${url}...`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    if (data.data) {
      console.log(`Bag ID: ${data.data.id}`);
      console.log(`Document ID: ${data.data.documentId}`);
      console.log(`Name: ${data.data.Name}`);
      console.log(`Payments inside user_orders:`);
      const payments = data.data.user_orders?.payments || [];
      payments.forEach(p => {
        console.log(`- TxnId: ${p.merchantTxnId} | Status: ${p.status} | EmailSent: ${p.emailSent}`);
      });
    } else {
      console.log(`No data returned:`, data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";
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

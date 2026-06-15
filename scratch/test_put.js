const NEXT_API_URL = "https://traditionalalley.com.np";
const BAG_ID = "ei7z170bfkv6ag9h2gwe0uu7";

async function run() {
  try {
    // 1. GET
    const getUrl = `${NEXT_API_URL}/api/user-bags/${BAG_ID}?populate=*`;
    console.log(`1. GET Request to ${getUrl}...`);
    const getRes = await fetch(getUrl);
    console.log(`GET Status: ${getRes.status}`);
    const getData = await getRes.json();
    console.log(`GET Response keys:`, Object.keys(getData));
    if (getData.data) {
      console.log(`GET data.id:`, getData.data.id);
      console.log(`GET data.documentId:`, getData.data.documentId);
    }
    
    // 2. PUT
    const putUrl = `${NEXT_API_URL}/api/user-bags/${BAG_ID}`;
    console.log(`\n2. PUT Request to ${putUrl}...`);
    const payload = {
      data: {
        user_orders: {
          test: "test_value",
          payments: getData.data?.user_orders?.payments || []
        }
      }
    };
    
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`PUT Status: ${putRes.status}`);
    const putBodyText = await putRes.text();
    console.log(`PUT Response body:`, putBodyText);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

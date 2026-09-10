const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
const BAG_ID = "rbhex4uk9lk50dk521f53kuo";

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
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

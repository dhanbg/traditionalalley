const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
const TXN_ID = "TXN-1776418781779-fwby1ew28";

async function run() {
  try {
    const url = `${STRAPI_URL}/api/user-bags?pagination[pageSize]=10&sort=updatedAt:desc`;
    console.log(`Querying: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Data (first bag):`, JSON.stringify(data.data?.[0], null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();




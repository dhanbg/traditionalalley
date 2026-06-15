const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";
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




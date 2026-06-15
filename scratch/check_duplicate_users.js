const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";
const AUTH_USER_ID = "google_110575689560947103257";

async function run() {
  try {
    const url = `${STRAPI_URL}/api/user-data?filters[authUserId][$eq]=${AUTH_USER_ID}&populate=*`;
    console.log(`Querying: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} user records.`);
    
    if (data.data) {
      data.data.forEach((user, index) => {
        console.log(`\n[User ${index + 1}]`);
        console.log(`  ID: ${user.id}`);
        console.log(`  DocumentID: ${user.documentId}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  user_bag:`, user.user_bag ? `Yes (${user.user_bag.documentId})` : `No`);
        if (user.user_bag) {
          console.log(`    user_bag name: ${user.user_bag.Name}`);
          console.log(`    user_bag updated: ${user.user_bag.updatedAt}`);
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

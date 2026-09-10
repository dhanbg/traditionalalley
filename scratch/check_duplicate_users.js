const STRAPI_URL = "https://admin.traditionalalley.com.np";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
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

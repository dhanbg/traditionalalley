async function run() {
  const url = "https://traditionalalley.com.np/api/products?pagination[limit]=4&populate=*";
  console.log(`Querying ${url}...`);
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Keys in response:`, Object.keys(data));
    if (data.data) {
      console.log(`Found ${data.data.length} products`);
      data.data.slice(0, 2).forEach((p, idx) => {
        console.log(`Product ${idx + 1}: ${p.title || p.name} (id: ${p.id})`);
      });
    } else {
      console.log(`Response body:`, data);
    }
  } catch (err) {
    console.error(`Request failed:`, err.message);
  }
}

run();

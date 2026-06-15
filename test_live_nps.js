const https = require('https');

function makeRequest(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://traditionalalley.com.np',
        'Referer': 'https://traditionalalley.com.np/checkout',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: body
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  const payload = {
    amount: 10,
    merchantTxnId: `TXN-${Date.now()}`,
    transactionRemarks: "Test live API",
    customer_info: {
      name: "Test Customer",
      email: "test@example.com",
      phone: "9844594187"
    }
  };

  console.log('Sending payload to live server:', JSON.stringify(payload, null, 2));

  try {
    const response = await makeRequest('https://traditionalalley.com.np/api/nps-initiate', payload);
    console.log('Response Status:', response.statusCode);
    try {
      const parsed = JSON.parse(response.data);
      console.log('Response Data:', JSON.stringify(parsed, null, 2));
    } catch {
      console.log('Response Data (Raw):', response.data);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

run();

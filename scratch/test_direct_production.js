const https = require('https');
const crypto = require('crypto');

const production = {
  baseURL: 'https://apigateway.nepalpayment.com',
  merchantId: '530',
  merchantName: 'traditionalapiuser',
  apiUsername: 'traditionalapiuser',
  apiPassword: 'D9v@eX#2LmZ!q',
  secretKey: 'T$5nLz#o1Xp@'
};

function generateNPSSignature(data, secretKey) {
  return crypto
    .createHmac('sha512', secretKey)
    .update(data)
    .digest('hex')
    .toLowerCase();
}

function createAPISignature(params, secretKey) {
  const { Signature, ...cleanParams } = params;
  const sortedKeys = Object.keys(cleanParams).sort();
  const concatenatedValues = sortedKeys.map(key => cleanParams[key]).join('');
  return generateNPSSignature(concatenatedValues, secretKey);
}

function makeHttpsRequest(config, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.baseURL + path);
    const postData = JSON.stringify(data);
    const authHeader = 'Basic ' + Buffer.from(config.apiUsername + ':' + config.apiPassword).toString('base64');

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
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

async function makeFetchRequest(config, path, data) {
  const url = config.baseURL + path;
  const authHeader = 'Basic ' + Buffer.from(config.apiUsername + ':' + config.apiPassword).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(data)
  });

  const body = await response.text();
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    data: body
  };
}

async function run() {
  const amount = 10;
  
  // 1. Test HTTPS request
  console.log('--- TESTING DIRECT HTTPS REQUEST ---');
  const txnId1 = `TXN-HTTPS-${Date.now()}`;
  const payload1 = {
    MerchantId: production.merchantId,
    MerchantName: production.merchantName,
    Amount: parseFloat(amount.toString()).toFixed(2),
    MerchantTxnId: txnId1,
    Signature: ""
  };
  payload1.Signature = createAPISignature(payload1, production.secretKey);
  
  try {
    const res = await makeHttpsRequest(production, '/GetProcessId', payload1);
    console.log('Status:', res.statusCode);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('HTTPS failed:', err.message);
  }

  // 2. Test FETCH request
  console.log('\n--- TESTING DIRECT FETCH REQUEST ---');
  const txnId2 = `TXN-FETCH-${Date.now()}`;
  const payload2 = {
    MerchantId: production.merchantId,
    MerchantName: production.merchantName,
    Amount: parseFloat(amount.toString()).toFixed(2),
    MerchantTxnId: txnId2,
    Signature: ""
  };
  payload2.Signature = createAPISignature(payload2, production.secretKey);

  try {
    const res = await makeFetchRequest(production, '/GetProcessId', payload2);
    console.log('Status:', res.statusCode);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('FETCH failed:', err.message);
  }
}

run();

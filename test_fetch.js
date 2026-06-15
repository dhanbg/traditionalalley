const crypto = require('crypto');

const config = {
  baseURL: 'https://apigateway.nepalpayment.com',
  merchantId: '530',
  merchantName: 'traditionalapiuser',
  apiUsername: 'traditionalapiuser',
  apiPassword: 'D9v@eX#2LmZ!q',
  secretKey: 'T$5nLz#o1Xp@'
};

function generateNPSSignature(data, secretKey) {
  return crypto.createHmac('sha512', secretKey).update(data).digest('hex').toLowerCase();
}

async function run() {
  console.log('=== Testing Native Fetch from inside container ===');
  const merchantTxnId = 'TXN-' + Date.now();
  const processIdRequest = {
    MerchantId: config.merchantId,
    MerchantName: config.merchantName,
    Amount: '10.00',
    MerchantTxnId: merchantTxnId,
    Signature: ''
  };

  const signature = generateNPSSignature('10.00530traditionalapiuser' + merchantTxnId, config.secretKey);
  processIdRequest.Signature = signature;

  const authHeader = 'Basic ' + Buffer.from(config.apiUsername + ':' + config.apiPassword).toString('base64');

  try {
    const response = await fetch(config.baseURL + '/GetProcessId', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(processIdRequest)
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

run();

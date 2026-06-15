const https = require('https');
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

const url = new URL(config.baseURL + '/GetProcessId');
const postData = JSON.stringify(processIdRequest);
const authHeader = 'Basic ' + Buffer.from(config.apiUsername + ':' + config.apiPassword).toString('base64');

// Test with Axios user agent
const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': authHeader,
    'User-Agent': 'axios/1.7.9', // Set Axios user agent
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.write(postData);
req.end();

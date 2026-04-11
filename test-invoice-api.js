const fs = require('fs');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Simple fetch implementation using Node.js built-in modules
function simpleFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test the actual invoice API endpoint
async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API Endpoint...');
  console.log('==================================');
  
  // Create a simple test PDF as base64
  const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Invoice) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;
  
  const pdfBase64 = Buffer.from(testPdfContent).toString('base64');
  
  const testData = {
    customerEmail: 'test@example.com', // Replace with your test email
    customerName: 'Test Customer',
    orderId: 'TEST-API-001',
    amount: 'NPR 1,500.00',
    pdfBase64: pdfBase64,
    fileName: 'test-invoice-api.pdf'
  };
  
  try {
    console.log('📤 Sending request to /api/send-invoice-email...');
    console.log('Customer Email:', testData.customerEmail);
    console.log('Order ID:', testData.orderId);
    console.log('Amount:', testData.amount);
    
    const response = await simpleFetch('http://localhost:3000/api/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📥 Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    const responseData = await response.json();
    console.log('Response Data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok && responseData.success) {
      console.log('\n✅ API Test Successful!');
      console.log('📧 Invoice email sent successfully via API');
      console.log('\n📋 Next Steps:');
      console.log('- Check the recipient\'s inbox (and spam folder)');
      console.log('- Verify the PDF attachment is readable');
      console.log('- The API endpoint is working correctly');
    } else {
      console.log('\n❌ API Test Failed!');
      console.log('Error:', responseData.error || 'Unknown error');
      
      console.log('\n🔧 Troubleshooting:');
      console.log('- Check if the Next.js development server is running');
      console.log('- Verify the API route exists at pages/api/send-invoice-email.js');
      console.log('- Check server logs for detailed error information');
    }
    
  } catch (error) {
    console.error('\n❌ API Test Failed with Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Refused - Possible Issues:');
      console.log('- Next.js development server is not running');
      console.log('- Server is running on a different port');
      console.log('- Firewall is blocking the connection');
      console.log('\n💡 Solution: Make sure to run "npm run dev" first');
    } else {
      console.log('\n🔧 Other possible issues:');
      console.log('- Network connectivity problems');
      console.log('- Invalid request format');
      console.log('- Server-side error in the API route');
    }
  }
}

// Test with different scenarios
async function runComprehensiveTests() {
  console.log('📧 Invoice API Test Suite');
  console.log('=========================');
  
  // Test 1: Basic API functionality
  await testInvoiceAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Additional Debugging Information:');
  console.log('='.repeat(50));
  
  // Check environment variables
  console.log('\n📋 Environment Variables Check:');
  const requiredVars = [
    'HOSTINGER_SMTP_HOST',
    'HOSTINGER_SMTP_PORT',
    'HOSTINGER_SMTP_USER',
    'HOSTINGER_SMTP_PASS',
    'HOSTINGER_SMTP_FROM'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName === 'HOSTINGER_SMTP_PASS') {
        console.log(`✅ ${varName}: ${'*'.repeat(value.length)} (hidden)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: NOT SET`);
    }
  });
  
  console.log('\n💡 Tips for Debugging:');
  console.log('- Check the browser\'s Network tab when generating invoices');
  console.log('- Look at the Next.js server console for error messages');
  console.log('- Verify that customer email addresses are valid');
  console.log('- Test with a known working email address first');
  console.log('- Check if emails are going to spam folder');
}

if (require.main === module) {
  runComprehensiveTests().catch(error => {
    console.error('Test suite failed:', error);
  });
}

module.exports = {
  testInvoiceAPI,
  runComprehensiveTests
};
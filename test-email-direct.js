const http = require('http');

// Test the email API directly with the user's email
async function testEmailAPI() {
  console.log('🧪 Testing Email API with gurungvaaiii@gmail.com');
  console.log('=' .repeat(50));
  
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
    customerEmail: 'gurungvaaiii@gmail.com',
    customerName: 'Test Customer',
    orderId: 'TEST-EMAIL-' + Date.now(),
    amount: 'NPR 1,500.00',
    pdfBase64: pdfBase64,
    fileName: 'test-invoice.pdf'
  };
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/send-invoice-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    console.log('📤 Sending request to API...');
    console.log('📧 Email:', testData.customerEmail);
    console.log('📋 Order ID:', testData.orderId);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log('📥 Response Status:', res.statusCode, res.statusMessage);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📧 API Response:', response);
          
          if (res.statusCode === 200 && response.success) {
            console.log('\n✅ SUCCESS! Email API call completed successfully');
            console.log('📧 Email should be sent to: gurungvaaiii@gmail.com');
            console.log('\n📋 Next Steps:');
            console.log('1. Check your email inbox (gurungvaaiii@gmail.com)');
            console.log('2. Check spam/junk folder');
            console.log('3. Wait a few minutes for delivery');
            console.log('\n💡 If email is not received:');
            console.log('- Check email server logs in the npm run dev terminal');
            console.log('- Verify SMTP settings in .env file');
            console.log('- Try with a different email address');
            resolve(response);
          } else {
            console.log('\n❌ FAILED! API returned error');
            console.log('Error:', response.error || 'Unknown error');
            reject(new Error(response.error || 'API call failed'));
          }
        } catch (parseError) {
          console.log('\n❌ FAILED! Could not parse API response');
          console.log('Raw response:', data);
          reject(parseError);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('\n❌ FAILED! Request error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Connection refused - possible issues:');
        console.log('- Next.js server is not running (run: npm run dev)');
        console.log('- Server is running on different port');
        console.log('- Firewall blocking connection');
      }
      
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the test
console.log('🚀 Starting direct email API test...');
console.log('🎯 Target: gurungvaaiii@gmail.com');
console.log('🔗 Endpoint: http://localhost:3000/api/send-invoice-email\n');

testEmailAPI()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed:', error.message);
    process.exit(1);
  });
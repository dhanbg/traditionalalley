// Test script to send "Hello" message to rohitgurung0915@gmail.com
// Uses the existing /api/send-invoice-email endpoint

const http = require('http');

console.log('=== Test Email Sending - Hello Message ===\n');

// Create a simple test PDF with "Hello" message
function createTestPDF() {
  // Simple PDF content as base64 (minimal PDF structure with "Hello" text)
  const pdfContent = `%PDF-1.4
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
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 85
>>
stream
BT
/F1 24 Tf
100 700 Td
(Hello!) Tj
0 -50 Td
/F1 12 Tf
(This is a test message from Traditional Alley) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000349 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
483
%%EOF`;
  
  return Buffer.from(pdfContent).toString('base64');
}

// Send Hello email via API
async function sendHelloViaAPI() {
  return new Promise((resolve, reject) => {
    try {
      console.log('📧 Preparing to send Hello email via API...');
      
      const testPdfBase64 = createTestPDF();
      
      const emailData = {
        customerEmail: 'gurungvaaiii@gmail.com',
        customerName: 'Gurung',
        orderId: 'HELLO_TEST_' + Date.now(),
        amount: '$0.00 (Test Message)',
        pdfBase64: testPdfBase64,
        fileName: 'Hello_Message.pdf'
      };
      
      console.log('📋 Email Details:');
      console.log('  To:', emailData.customerEmail);
      console.log('  Name:', emailData.customerName);
      console.log('  Order ID:', emailData.orderId);
      console.log('  Amount:', emailData.amount);
      console.log('  File:', emailData.fileName);
      
      const postData = JSON.stringify(emailData);
      
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
      
      console.log('\n🚀 Sending API request...');
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            console.log('\n📥 API Response Status:', res.statusCode);
            console.log('Response Data:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.success) {
              console.log('\n✅ SUCCESS: Hello email sent successfully!');
              console.log('📧 Email sent to:', emailData.customerEmail);
              console.log('📨 Message ID:', response.messageId || 'N/A');
              console.log('\n🎉 The recipient should receive:');
              console.log('  - Subject: Invoice for Order ' + emailData.orderId);
              console.log('  - A "Hello!" message in PDF attachment');
              console.log('  - Professional email template from Traditional Alley');
              console.log('\n✅ Please check your Gmail inbox and spam folder.');
              console.log('🎯 This test will show if emails are being delivered to inbox or spam folder.');
              resolve(response);
            } else {
              console.log('\n❌ FAILED: Email sending failed');
              console.log('Error:', response.error || 'Unknown error');
              console.log('Status Code:', res.statusCode);
              reject(new Error(response.error || 'Email sending failed'));
            }
            
          } catch (parseError) {
            console.log('\n❌ API Response parsing failed:', parseError.message);
            console.log('Raw response:', data);
            reject(parseError);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log('\n❌ API Request failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
          console.log('\n🔧 Connection Refused - Possible Issues:');
          console.log('- Next.js development server is not running');
          console.log('- Server is running on a different port');
          console.log('- Try running: npm run dev');
        }
        
        reject(error);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('🚨 API method error:', error.message);
      reject(error);
    }
  });
}

// Main execution
async function main() {
  console.log('🎯 Testing email sending to gurungvaaiii@gmail.com');
  console.log('📝 Message: "Hello!" (embedded in PDF)');
  console.log('🏢 Using Traditional Alley email infrastructure');
  console.log('🔗 API Endpoint: /api/send-invoice-email\n');
  
  try {
    console.log('🔍 Checking email infrastructure...');
    
    // Send email via API
    await sendHelloViaAPI();
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 What happened:');
    console.log('✅ Created a PDF with "Hello!" message');
    console.log('✅ Sent API request to /api/send-invoice-email');
    console.log('✅ Email should be delivered to gurungvaaiii@gmail.com');
    
  } catch (error) {
    console.error('\n🚨 Test failed:', error.message);
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Ensure the development server is running:');
    console.log('   npm run dev');
    console.log('2. Check that the server is running on port 3000');
    console.log('3. Verify email environment variables are set');
    console.log('4. Check server console for detailed error messages');
    
    console.log('\n🔧 Quick checks:');
    console.log('- Is http://localhost:3000 accessible?');
    console.log('- Are there any errors in the npm run dev terminal?');
    console.log('- Is the /api/send-invoice-email endpoint working?');
  }
}

// Execute the test
console.log('⏳ Starting Hello email test...');
main().then(() => {
  console.log('\n✨ Test execution completed.');
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error.message);
});

console.log('\n📋 Test Information:');
console.log('• Recipient: gurungvaaiii@gmail.com');
console.log('• Message: "Hello!" in PDF format');
console.log('• Method: API call to /api/send-invoice-email');
console.log('• Infrastructure: Traditional Alley email system');
console.log('• Expected: Professional invoice email with PDF attachment');
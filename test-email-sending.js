const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Test email configuration
const testConfig = {
  customerEmail: 'test@example.com', // Replace with your test email
  customerName: 'Test Customer',
  orderId: 'TEST-001',
  amount: 99.99,
  fileName: 'test-invoice.pdf'
};

// Create a simple test PDF buffer
function createTestPdfBuffer() {
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
  return Buffer.from(testPdfContent);
}

// Create Hostinger SMTP transporter
function createHostingerTransporter() {
  return nodemailer.createTransport({
    host: process.env.HOSTINGER_SMTP_HOST,
    port: parseInt(process.env.HOSTINGER_SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.HOSTINGER_SMTP_USER,
      pass: process.env.HOSTINGER_SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Test SMTP connection
async function testSMTPConnection() {
  console.log('\n1. Testing SMTP Connection...');
  
  const transporter = createHostingerTransporter();
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
}

// Send test invoice email
async function sendTestInvoiceEmail() {
  console.log('\n2. Testing Email Sending...');
  console.log(`Sending test email to: ${testConfig.customerEmail}`);
  
  const transporter = createHostingerTransporter();
  const testPdfBuffer = createTestPdfBuffer();
  
  const mailOptions = {
    from: process.env.HOSTINGER_SMTP_FROM,
    to: testConfig.customerEmail,
    subject: `Invoice #${testConfig.orderId} - Traditional Alley`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Traditional Alley</h1>
          <p style="color: #666; margin: 5px 0;">Your Invoice is Ready</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Dear ${testConfig.customerName},</h2>
          
          <p>Thank you for your purchase! Please find your invoice attached to this email.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${testConfig.orderId}</p>
            <p><strong>Amount:</strong> $${testConfig.amount}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          <strong>Traditional Alley Team</strong></p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">© 2024 Traditional Alley. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: testConfig.fileName,
        content: testPdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📄 Invoice ID: ${testConfig.orderId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEmailSending() {
  console.log('🧪 Starting Email Sending Test...');
  console.log('================================');
  
  try {
    // Step 1: Test SMTP connection
    const connectionSuccess = await testSMTPConnection();
    
    if (!connectionSuccess) {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('- Check your .env file for correct SMTP settings');
      console.log('- Verify HOSTINGER_SMTP_PASS is set correctly');
      console.log('- Ensure your Hostinger email account is active');
      return;
    }
    
    // Step 2: Test email sending
    const result = await sendTestInvoiceEmail();
    
    if (result.success) {
      console.log('\n✨ Test completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('- Check the recipient\'s inbox (and spam folder)');
      console.log('- Verify the PDF attachment is readable');
      console.log('- Test with the actual invoice generation system');
    } else {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('- Check if the recipient email is valid');
      console.log('- Verify your Hostinger email quota isn\'t exceeded');
      console.log('- Check spam folder of recipient');
      console.log('- Ensure SMTP credentials are correct');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🔧 Common Issues:');
    console.log('- Missing environment variables in .env file');
    console.log('- Incorrect SMTP configuration');
    console.log('- Network connectivity issues');
    console.log('- Invalid email credentials');
  }
}

// Debug email configuration
function debugEmailConfig() {
  console.log('🔍 Email Configuration Debug:');
  console.log('==============================');
  
  const requiredEnvVars = [
    'HOSTINGER_SMTP_HOST',
    'HOSTINGER_SMTP_PORT', 
    'HOSTINGER_SMTP_USER',
    'HOSTINGER_SMTP_PASS',
    'HOSTINGER_SMTP_FROM'
  ];
  
  requiredEnvVars.forEach(varName => {
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
}

// Run the tests
if (require.main === module) {
  console.log('📧 Email Sending Test Suite');
  console.log('===========================');
  
  debugEmailConfig();
  testEmailSending().catch(error => {
    console.error('Test suite failed:', error);
  });
}

module.exports = {
  testEmailSending,
  debugEmailConfig,
  createTestPdfBuffer,
  sendTestInvoiceEmail
};